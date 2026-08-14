import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Alert, FlatList, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song, Playlist } from '../types';
import { colors } from '../utils/colors';
import { formatDuration } from '../utils/formats';
import { usePlayerStore } from '../store/usePlayerStore';

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
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isPlaylistPickerVisible, setIsPlaylistPickerVisible] = useState(false);
  const enqueueNext = usePlayerStore((state) => state.enqueueNext);

  const handleMenu = () => {
    setIsMenuVisible(true);
  };

  const openPlaylistPicker = () => {
    if (!playlists?.length) {
      Alert.alert('Playlist Yok', 'Önce bir playlist oluşturmalısın.');
      return;
    }

    setIsPlaylistPickerVisible(true);
  };

  const addToPlaylist = (playlistId: string) => {
    setIsPlaylistPickerVisible(false);
    onAddToPlaylist?.(playlistId);
  };

  const addToQueue = () => {
    setIsMenuVisible(false);
    enqueueNext(song);
  };

  const removeSong = () => {
    setIsMenuVisible(false);
    onRemove?.();
  };

  return (
    <>
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

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsMenuVisible(false)}>
          <Pressable style={styles.actionMenu} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle} numberOfLines={1}>{song.title}</Text>
            <TouchableOpacity style={styles.actionOption} onPress={addToQueue}>
              <Ionicons name="list-outline" size={19} color={colors.text} />
              <Text style={styles.actionOptionText}>Sıraya Ekle</Text>
            </TouchableOpacity>
            {playlists && (
              <TouchableOpacity
                style={styles.actionOption}
                onPress={() => {
                  setIsMenuVisible(false);
                  openPlaylistPicker();
                }}
              >
                <Ionicons name="add-circle-outline" size={19} color={colors.text} />
                <Text style={styles.actionOptionText}>Listeye Ekle</Text>
              </TouchableOpacity>
            )}
            {onRemove && (
              <TouchableOpacity style={styles.actionOption} onPress={removeSong}>
                <Ionicons name="trash-outline" size={19} color={colors.error} />
                <Text style={styles.destructiveOptionText}>{playlists ? 'Kütüphaneden Sil' : 'Listeden Çıkar'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsMenuVisible(false)}>
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isPlaylistPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPlaylistPickerVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsPlaylistPickerVisible(false)}>
          <Pressable style={styles.modalBox} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>Listeye Ekle</Text>
            <Text style={styles.modalSubtitle} numberOfLines={1}>{song.title}</Text>
            <FlatList
              data={playlists}
              keyExtractor={(playlist) => playlist.id}
              renderItem={({ item: playlist }) => (
                <TouchableOpacity
                  style={styles.playlistOption}
                  onPress={() => addToPlaylist(playlist.id)}
                >
                  <Ionicons name="list" size={18} color={colors.primary} />
                  <Text style={styles.playlistOptionText} numberOfLines={1}>{playlist.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.playlistList}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsPlaylistPickerVisible(false)}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  actionMenu: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  playlistList: {
    flexGrow: 0,
  },
  playlistOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  actionOptionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  destructiveOptionText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
  playlistOptionText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
