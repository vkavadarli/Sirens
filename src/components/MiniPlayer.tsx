import React from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../store/usePlayerStore';
import { colors } from '../utils/colors';
import { RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function MiniPlayer() {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const { currentSong, isPlaying, togglePlay, playNext, isPlayerExpanded } = usePlayerStore();

  if (!currentSong || isPlayerExpanded) return null;

  return (
    <TouchableOpacity
      style={[styles.container, { bottom: insets.bottom + 68 }]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Player')}
    >
      <View style={styles.artworkContainer}>
        {currentSong.artwork ? (
          <Image source={{ uri: currentSong.artwork }} style={styles.artwork} />
        ) : (
          <View style={styles.artworkPlaceholder}>
            <Ionicons name="musical-note" size={20} color={colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentSong.artist}</Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={togglePlay} hitSlop={8}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={26}
          color={colors.text}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={playNext} hitSlop={8}>
        <Ionicons name="play-skip-forward" size={22} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Bottom offset is applied dynamically for the Android system navigation bar and tab bar.
    left: 8,
    right: 8,
    height: 64,
    backgroundColor: colors.miniPlayer,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  artworkContainer: {
    marginRight: 12,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  artworkPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  btn: {
    paddingHorizontal: 8,
  },
});
