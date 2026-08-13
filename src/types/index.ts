export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // milliseconds, 0 until first play
  uri: string; // local file:// URI
  artwork?: string; // local file:// URI or undefined
  addedAt: number; // timestamp
  format: string; // mp3, wav, etc.
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
}

export type RepeatMode = 'none' | 'one' | 'all';

export type RootStackParamList = {
  Main: undefined;
  Player: undefined;
  PlaylistDetail: { playlistId: string };
};

export type MainTabParamList = {
  Library: undefined;
  Playlists: undefined;
  Search: undefined;
};
