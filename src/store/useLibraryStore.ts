import { create } from 'zustand';
import { Song, Playlist } from '../types';
import { saveSongs, loadSongs, savePlaylists, loadPlaylists } from '../utils/storage';
import { deleteSongFile } from '../utils/zipImport';

interface LibraryState {
  songs: Song[];
  playlists: Playlist[];
  isLoaded: boolean;

  loadLibrary: () => Promise<void>;
  addSongs: (newSongs: Song[]) => Promise<void>;
  removeSong: (id: string) => Promise<void>;
  updateSongDuration: (id: string, duration: number) => Promise<void>;

  createPlaylist: (name: string) => Promise<string>;
  deletePlaylist: (id: string) => Promise<void>;
  renamePlaylist: (id: string, name: string) => Promise<void>;
  addSongToPlaylist: (songId: string, playlistId: string) => Promise<void>;
  removeSongFromPlaylist: (songId: string, playlistId: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  songs: [],
  playlists: [],
  isLoaded: false,

  loadLibrary: async () => {
    const [songs, playlists] = await Promise.all([loadSongs(), loadPlaylists()]);
    set({ songs, playlists, isLoaded: true });
  },

  addSongs: async (newSongs) => {
    const { songs } = get();
    // Deduplicate by URI
    const existingUris = new Set(songs.map((s) => s.uri));
    const unique = newSongs.filter((s) => !existingUris.has(s.uri));
    const updated = [...songs, ...unique];
    set({ songs: updated });
    await saveSongs(updated);
  },

  removeSong: async (id) => {
    const { songs, playlists } = get();
    const song = songs.find((s) => s.id === id);
    if (song) await deleteSongFile(song.uri);

    const updatedSongs = songs.filter((s) => s.id !== id);
    const updatedPlaylists = playlists.map((p) => ({
      ...p,
      songIds: p.songIds.filter((sid) => sid !== id),
    }));

    set({ songs: updatedSongs, playlists: updatedPlaylists });
    await Promise.all([saveSongs(updatedSongs), savePlaylists(updatedPlaylists)]);
  },

  updateSongDuration: async (id, duration) => {
    const { songs } = get();
    const updated = songs.map((s) => (s.id === id ? { ...s, duration } : s));
    set({ songs: updated });
    await saveSongs(updated);
  },

  createPlaylist: async (name) => {
    const id = Date.now().toString();
    const playlist: Playlist = { id, name, songIds: [], createdAt: Date.now() };
    const updated = [...get().playlists, playlist];
    set({ playlists: updated });
    await savePlaylists(updated);
    return id;
  },

  deletePlaylist: async (id) => {
    const updated = get().playlists.filter((p) => p.id !== id);
    set({ playlists: updated });
    await savePlaylists(updated);
  },

  renamePlaylist: async (id, name) => {
    const updated = get().playlists.map((p) => (p.id === id ? { ...p, name } : p));
    set({ playlists: updated });
    await savePlaylists(updated);
  },

  addSongToPlaylist: async (songId, playlistId) => {
    const updated = get().playlists.map((p) =>
      p.id === playlistId && !p.songIds.includes(songId)
        ? { ...p, songIds: [...p.songIds, songId] }
        : p
    );
    set({ playlists: updated });
    await savePlaylists(updated);
  },

  removeSongFromPlaylist: async (songId, playlistId) => {
    const updated = get().playlists.map((p) =>
      p.id === playlistId ? { ...p, songIds: p.songIds.filter((id) => id !== songId) } : p
    );
    set({ playlists: updated });
    await savePlaylists(updated);
  },
}));
