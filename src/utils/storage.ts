import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song, Playlist } from '../types';

const SONGS_KEY = '@sirens_songs';
const PLAYLISTS_KEY = '@sirens_playlists';

export async function saveSongs(songs: Song[]): Promise<void> {
  await AsyncStorage.setItem(SONGS_KEY, JSON.stringify(songs));
}

export async function loadSongs(): Promise<Song[]> {
  const data = await AsyncStorage.getItem(SONGS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function savePlaylists(playlists: Playlist[]): Promise<void> {
  await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

export async function loadPlaylists(): Promise<Playlist[]> {
  const data = await AsyncStorage.getItem(PLAYLISTS_KEY);
  return data ? JSON.parse(data) : [];
}
