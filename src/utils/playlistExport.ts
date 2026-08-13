import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { zip } from 'react-native-zip-archive';
import { Playlist, Song } from '../types';

const EXPORT_DIR = FileSystem.cacheDirectory + 'exports/';

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._ -]/g, '_').trim() || 'playlist';
}

export async function exportAndSharePlaylist(playlist: Playlist, songs: Song[]): Promise<void> {
  const sourceFiles = (await Promise.all(songs.map(async (song) => {
    const info = await FileSystem.getInfoAsync(song.uri);
    return info.exists ? { uri: song.uri, format: song.format } : null;
  }))).filter((song): song is { uri: string; format: string } => song !== null);
  if (sourceFiles.length === 0) {
    throw new Error('Bu playlistte dışa aktarılacak şarkı yok.');
  }

  const exportDirectoryInfo = await FileSystem.getInfoAsync(EXPORT_DIR);
  if (!exportDirectoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(EXPORT_DIR, { intermediates: true });
  }

  const archiveUri = EXPORT_DIR + `${safeFilename(playlist.name)}.zip`;
  const stagingDirectory = EXPORT_DIR + `staging-${Date.now()}/`;
  await FileSystem.deleteAsync(archiveUri, { idempotent: true });
  await FileSystem.makeDirectoryAsync(stagingDirectory, { intermediates: true });

  try {
    await Promise.all(sourceFiles.map((song, index) =>
      FileSystem.copyAsync({
        from: song.uri,
        to: stagingDirectory + `${String(index + 1).padStart(3, '0')}.${safeFilename(song.format)}`,
      })
    ));
    await zip(stagingDirectory, archiveUri);
  } finally {
    await FileSystem.deleteAsync(stagingDirectory, { idempotent: true });
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Bu cihazda paylaşım menüsü kullanılamıyor.');
  }
  await Sharing.shareAsync(archiveUri, {
    mimeType: 'application/zip',
    dialogTitle: `${playlist.name} playlistini paylaş`,
    UTI: 'public.zip-archive',
  });
}