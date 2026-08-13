import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song, Playlist } from '../types';
import { colors } from '../utils/colors';
import { formatDuration } from '../utils/formats';

interface Props {
  song: Song;
  onPress: () => void;
  onLongPress?: () => void;
  showMenu?: boolean;
  onRemove?: () => void;
  playlists?: Playlist[];
  onAddToPlaylist?: (playlistId: string) => void;
  isActive?: boolean;
}

export default function SongItem({
  song,
  onPress,
  onLongPress,
  showMenu,
  onRemove,
  playlists,
  onAddToPlaylist,
  isActive,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenu = () => {
    const options = ['Kaldır'];
    if (playlists && playlists.length > 0) {
      playlists.forEach((p) => options.push(`"${p.name}" playlistine ekle`));
    }
    options.push('İptal');

    Alert.alert(song.title, undefined, [
      {
        text: 'Kütüphaneden Sil',
        style: 'destructive',
        onPress: () => onRemove?.(),
      },
      ...(playlists ?? []).map((p) => ({
        text: `"${p.name}" listesine ekle`,
        onPress: () => onAddToPlaylist?.(p.id),
      })),
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.active]}
      onPress={onPress}
      onLongPress={onLongPress ?? handleMenu}
      activeOpacity={0.7}
    >
      <View style={styles.artworkContainer}>
        {song.artwork ? (
          <Image source={{ uri: song.artwork }} style={styles.artwork} />
        ) : (
          <View style={styles.artworkPlaceholder}>
            <Ionicons name="musical-note" size={18} color={isActive ? colors.primary : colors.textMuted} />
          </View>
        )}
        {isActive && (
          <View style={styles.playingIndicator}>
            <Ionicons name="equalizer" size={10} color={colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, isActive && styles.activeTitle]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
          {song.album !== 'Unknown Album' ? ` · ${song.album}` : ''}
        </Text>
      </View>

      <View style={styles.right}>
        {song.duration > 0 && (
          <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
        )}
        {(showMenu || onRemove) && (
          <TouchableOpacity onPress={handleMenu} hitSlop={8} style={styles.menuBtn}>
            <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  active: {
    backgroundColor: colors.primaryGlow,
  },
  artworkContainer: {
    position: 'relative',
    marginRight: 12,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  artworkPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  info: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTitle: {
    color: colors.primary,
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  duration: {
    color: colors.textMuted,
    fontSize: 12,
  },
  menuBtn: {
    padding: 4,
  },
});
