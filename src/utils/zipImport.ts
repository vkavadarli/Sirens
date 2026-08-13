import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { unzip, subscribe } from 'react-native-zip-archive';
import { Song } from '../types';
import { isAudioFile, parseFilename } from './formats';

const MUSIC_DIR = FileSystem.documentDirectory + 'music/';
const IMPORT_DIR = FileSystem.documentDirectory + 'imports/';

export interface ZipImportResult {
  songs: Song[];
  playlistName: string;
}

export async function ensureMusicDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(MUSIC_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(MUSIC_DIR, { intermediates: true });
  }
}

async function listAudioFiles(directoryUri: string): Promise<string[]> {
  const entries = await FileSystem.readDirectoryAsync(directoryUri);
  const files: string[] = [];

  for (const entry of entries) {
    const uri = directoryUri + entry;
    const info = await FileSystem.getInfoAsync(uri);
    if (info.isDirectory) {
      files.push(...await listAudioFiles(uri + '/'));
    } else if (isAudioFile(entry)) {
      files.push(uri);
    }
  }

  return files;
}

export async function pickAndImportZip(
  onProgress?: (current: number, total: number, name: string) => void
): Promise<ZipImportResult | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const playlistName = asset.name.replace(/\.zip$/i, '').trim() || 'İçe Aktarılanlar';
  await ensureMusicDir();
  const importId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const targetDirectory = IMPORT_DIR + importId + '/';
  await FileSystem.makeDirectoryAsync(targetDirectory, { intermediates: true });

  // Native extraction is disk-to-disk: the archive is never expanded as Base64 in JS memory.
  const progressSubscription = subscribe(({ progress }) => {
    onProgress?.(Math.round(progress * 100), 100, 'Arşiv çıkarılıyor...');
  });

  try {
    await unzip(asset.uri, targetDirectory, 'UTF-8');
  } catch {
    throw new Error('ZIP arşivi açılamadı. Bozuk veya şifreli bir ZIP olabilir.');
  } finally {
    progressSubscription.remove();
  }

  const audioFiles = await listAudioFiles(targetDirectory);

  if (audioFiles.length === 0) {
    await FileSystem.deleteAsync(targetDirectory, { idempotent: true });
    throw new Error('ZIP içinde desteklenen bir müzik dosyası bulunamadı.');
  }

  const songs: Song[] = [];

  for (let i = 0; i < audioFiles.length; i++) {
    const sourceUri = audioFiles[i];
    const filename = sourceUri.split('/').pop() || `track-${i}`;

    onProgress?.(i + 1, audioFiles.length, filename);

    try {
      // Keep imported files in their native-extracted directory: no extra RAM-heavy copy.
      const destUri = sourceUri;

      const ext = filename.split('.').pop()?.toLowerCase() || '';
      const { title, artist, album } = parseFilename(filename);

      songs.push({
        id: Date.now().toString() + '_' + i,
        title,
        artist,
        album,
        duration: 0,
        uri: destUri,
        addedAt: Date.now(),
        format: ext,
      });
    } catch {
      // Continue importing the remaining tracks if one archive entry is unreadable.
    }
  }

  // Cleanup only the temporary picked ZIP; extracted tracks remain in app storage.
  try { await FileSystem.deleteAsync(asset.uri, { idempotent: true }); } catch {}

  if (songs.length === 0) {
    throw new Error('ZIP içindeki şarkılar uygulama depolamasına yazılamadı.');
  }

  return { songs, playlistName };
}

export async function deleteSongFile(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {}
}
