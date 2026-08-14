export const SUPPORTED_FORMATS = [
  'mp3', 'mpeg', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'opus', 'wma', 'aiff', 'aif',
];

export function isAudioFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return !!ext && SUPPORTED_FORMATS.includes(ext);
}

export function parseFilename(filename: string): { title: string; artist: string; album: string } {
  // Remove extension
  const base = filename.replace(/\.[^.]+$/, '');

  // Try "Artist - Title" pattern
  const dashMatch = base.match(/^(.+?)\s*-\s*(.+)$/);
  if (dashMatch) {
    return {
      artist: dashMatch[1].trim(),
      title: dashMatch[2].trim(),
      album: 'Unknown Album',
    };
  }

  return {
    artist: 'Unknown Artist',
    title: base.trim(),
    album: 'Unknown Album',
  };
}

export function formatDuration(ms: number): string {
  if (!ms || ms === 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
