import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, Dimensions, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '../store/usePlayerStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { colors } from '../utils/colors';
import { formatDuration } from '../utils/formats';
import ProgressSlider from '../components/ProgressSlider';

const { width, height } = Dimensions.get('window');
const ARTWORK_SIZE = width - 72;

export default function PlayerScreen() {
  const navigation = useNavigation();
  const {
    currentSong, isPlaying, position, duration,
    shuffle, repeat, isLoading,
    togglePlay, seekTo, playNext, playPrevious,
    toggleShuffle, toggleRepeat, updateDuration,
  } = usePlayerStore();

  const { updateSongDuration } = useLibraryStore();

  // Persist duration to library when we get it
  useEffect(() => {
    if (currentSong && duration > 0 && currentSong.duration === 0) {
      updateSongDuration(currentSong.id, duration);
    }
  }, [duration, currentSong?.id]);

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Çalan şarkı yok</Text>
        </View>
      </SafeAreaView>
    );
  }

  const repeatIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
    none: 'repeat',
    one: 'repeat-outline',
    all: 'repeat',
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a0a12', colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />

      <SafeAreaView style={styles.inner}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-down" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.topCenter}>
            <Text style={styles.topLabel}>ÇALIYOR</Text>
            <Text style={styles.topPlaylist} numberOfLines={1}>
              {currentSong.album !== 'Unknown Album' ? currentSong.album : 'Kütüphane'}
            </Text>
          </View>
          <View style={{ width: 28 }} />
        </View>

        {/* Artwork */}
        <View style={styles.artworkWrapper}>
          {currentSong.artwork ? (
            <Image source={{ uri: currentSong.artwork }} style={styles.artwork} />
          ) : (
            <View style={styles.artworkPlaceholder}>
              <Ionicons name="musical-notes" size={80} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Song info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>{currentSong.title}</Text>
          <Text style={styles.songArtist} numberOfLines={1}>{currentSong.artist}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <ProgressSlider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={position}
            onSlidingComplete={seekTo}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.surfaceBorder}
            thumbTintColor={colors.primary}
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatDuration(position)}</Text>
            <Text style={styles.timeText}>{formatDuration(duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Shuffle */}
          <TouchableOpacity onPress={toggleShuffle} hitSlop={8}>
            <Ionicons
              name="shuffle"
              size={24}
              color={shuffle ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>

          {/* Previous */}
          <TouchableOpacity onPress={playPrevious} hitSlop={8}>
            <Ionicons name="play-skip-back" size={36} color={colors.text} />
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity style={styles.playBtn} onPress={togglePlay} disabled={isLoading}>
            <Ionicons
              name={isLoading ? 'hourglass' : isPlaying ? 'pause' : 'play'}
              size={32}
              color="#000"
            />
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity onPress={playNext} hitSlop={8}>
            <Ionicons name="play-skip-forward" size={36} color={colors.text} />
          </TouchableOpacity>

          {/* Repeat */}
          <TouchableOpacity onPress={toggleRepeat} hitSlop={8}>
            <Ionicons
              name={repeat === 'one' ? 'repeat-outline' : 'repeat'}
              size={24}
              color={repeat !== 'none' ? colors.primary : colors.textMuted}
            />
            {repeat === 'one' && (
              <View style={styles.repeatOneDot} />
            )}
          </TouchableOpacity>
        </View>

        {/* Format badge */}
        <View style={styles.formatRow}>
          <View style={styles.formatBadge}>
            <Text style={styles.formatText}>{currentSong.format.toUpperCase()}</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backBtn: {
    padding: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 24,
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
  },
  topLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  topPlaylist: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  artworkWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 16,
  },
  artworkPlaceholder: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  songInfo: {
    marginBottom: 24,
  },
  songTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  songArtist: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
    marginHorizontal: -10,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  repeatOneDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    marginTop: 2,
  },
  formatRow: {
    alignItems: 'center',
    marginTop: 20,
  },
  formatBadge: {
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  formatText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
