import { create } from 'zustand';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Song, RepeatMode } from '../types';

let playbackRequestId = 0;

interface PlayerState {
  sound: any | null;
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  activePlaylistId: string | null;
  isPlaying: boolean;
  position: number; // ms
  duration: number; // ms
  shuffle: boolean;
  repeat: RepeatMode;
  isLoading: boolean;
  isPlayerExpanded: boolean;
  isPersistentTabBarVisible: boolean;

  playSong: (song: Song, queue?: Song[], index?: number, playlistId?: string | null) => Promise<void>;
  enqueueNext: (song: Song) => Promise<void>;
  togglePlay: () => Promise<void>;
  seekTo: (positionMs: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  updateDuration: (duration: number) => void;
  setPlayerExpanded: (expanded: boolean) => void;
  setPersistentTabBarVisible: (visible: boolean) => void;
  _onPlaybackUpdate: (status: any) => void;
  _cleanup: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  sound: null,
  currentSong: null,
  queue: [],
  queueIndex: 0,
  activePlaylistId: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  shuffle: false,
  repeat: 'none',
  isLoading: false,
  isPlayerExpanded: false,
  isPersistentTabBarVisible: false,

  _onPlaybackUpdate: (status: any) => {
    if (!status.isLoaded) return;
    set({
      isPlaying: status.playing,
      position: Math.round((status.currentTime ?? 0) * 1000),
      duration: Math.round((status.duration ?? 0) * 1000),
    });

    if (status.didJustFinish) {
      const { repeat } = get();
      if (repeat === 'one') {
        get().seekTo(0).then(() => get().sound?.play());
      } else {
        get().playNext();
      }
    }
  },

  setPlayerExpanded: (isPlayerExpanded) => set({ isPlayerExpanded }),

  setPersistentTabBarVisible: (isPersistentTabBarVisible) => set({ isPersistentTabBarVisible }),

  _cleanup: async () => {
    const { sound } = get();
    if (sound) {
      try {
        sound.pause();
        sound.clearLockScreenControls();
        sound.remove();
      } catch {}
    }
    set({ sound: null, isPlaying: false, position: 0, duration: 0 });
  },

  playSong: async (song, queue, index, playlistId = null) => {
    const requestId = ++playbackRequestId;
    set({ isLoading: true });

    await get()._cleanup();

    if (requestId !== playbackRequestId) return;

    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });

    if (requestId !== playbackRequestId) return;

    try {
      const sound = createAudioPlayer({ uri: song.uri }, { updateInterval: 500 });
      sound.addListener('playbackStatusUpdate', (status: any) => {
        if (get().sound !== sound || requestId !== playbackRequestId) return;
        get()._onPlaybackUpdate(status);
      });
      sound.setActiveForLockScreen(true, {
        title: song.title,
        artist: song.artist,
        albumTitle: song.album,
        artworkUrl: song.artwork,
      });

      if (requestId !== playbackRequestId) {
        sound.pause();
        sound.remove();
        return;
      }

      set({
        sound,
        currentSong: song,
        queue: queue ?? get().queue,
        queueIndex: index ?? get().queue.findIndex((s) => s.id === song.id),
        activePlaylistId: playlistId,
        isPlaying: false,
        position: 0,
        duration: Math.round((sound.duration ?? 0) * 1000),
        isLoading: false,
      });
      sound.play();
    } catch {
      if (requestId === playbackRequestId) set({ isLoading: false });
    }
  },

  enqueueNext: async (song) => {
    const { currentSong, queue, queueIndex } = get();
    if (!currentSong) {
      await get().playSong(song, [song], 0);
      return;
    }

    const updatedQueue = [...queue];
    updatedQueue.splice(queueIndex + 1, 0, song);
    set({ queue: updatedQueue });
  },

  togglePlay: async () => {
    const { sound, isPlaying, position, duration } = get();
    if (!sound) return;
    if (isPlaying) {
      sound.pause();
    } else {
      if (duration > 0 && position >= duration - 250) {
        await sound.seekTo(0);
        set({ position: 0 });
      }
      sound.play();
    }
  },

  seekTo: async (positionMs) => {
    const { sound } = get();
    if (!sound) return;
    await sound.seekTo(positionMs / 1000);
    set({ position: positionMs });
  },

  playNext: async () => {
    const { queue, queueIndex, repeat, shuffle, activePlaylistId } = get();
    if (queue.length === 0) return;

    let nextIndex: number;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else {
          return; // End of queue
        }
      }
    }
    const nextSong = queue[nextIndex];
    await get().playSong(nextSong, queue, nextIndex, activePlaylistId);
  },

  playPrevious: async () => {
    const { queue, queueIndex, position, activePlaylistId } = get();
    if (queue.length === 0) return;

    // If more than 3s in, restart current song
    if (position > 3000) {
      await get().seekTo(0);
      return;
    }

    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    await get().playSong(queue[prevIndex], queue, prevIndex, activePlaylistId);
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  toggleRepeat: () =>
    set((s) => {
      const order: RepeatMode[] = ['none', 'all', 'one'];
      const idx = order.indexOf(s.repeat);
      return { repeat: order[(idx + 1) % order.length] };
    }),

  updateDuration: (duration) => set({ duration }),
}));
