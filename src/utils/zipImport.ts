import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';
import { Song } from '../types';
import { isAudioFile, parseFilename } from './formats';

const MUSIC_DIR = FileSystem.documentDirectory + 'music/';

export async function ensureMusicDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(MUSIC_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(MUSIC_DIR, { intermediates: true });
  }
}

export async function pickAndImportZip(
  onProgress?: (current: number, total: number, name: string) => void
): Promise<Song[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return [];

  const asset = result.assets[0];
  await ensureMusicDir();

  // Read zip as base64
  const b64 = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const zip = new JSZip();
  await zip.loadAsync(b64, { base64: true });

  const audioFiles: Array<[string, JSZip.JSZipObject]> = [];
  zip.forEach((relativePath, file) => {
    if (!file.dir && isAudioFile(relativePath)) {
      // Only top-level and direct subfolder files, strip leading dirs from name
      audioFiles.push([relativePath, file]);
    }
  });

  if (audioFiles.length === 0) {
    throw new Error('ZIP içinde desteklenen bir müzik dosyası bulunamadı.');
  }

  const songs: Song[] = [];

  for (let i = 0; i < audioFiles.length; i++) {
    const [relativePath, file] = audioFiles[i];
    const filename = relativePath.split('/').pop() || relativePath;

    onProgress?.(i + 1, audioFiles.length, filename);

    try {
      const fileB64 = await file.async('base64');
      const destUri = MUSIC_DIR + filename.replace(/[^a-zA-Z0-9._-]/g, '_');

      // Skip if already exists
      const existing = await FileSystem.getInfoAsync(destUri);
      if (!existing.exists) {
        await FileSystem.writeAsStringAsync(destUri, fileB64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

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
    } catch (error) {
      throw new Error(`"${filename}" dosyası çıkarılamadı.`);
    }
  }

  // Cleanup cache
  try { await FileSystem.deleteAsync(asset.uri, { idempotent: true }); } catch {}

  if (songs.length === 0) {
    throw new Error('ZIP içindeki şarkılar uygulama depolamasına yazılamadı.');
  }

  return songs;
}

export async function deleteSongFile(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {}
}
