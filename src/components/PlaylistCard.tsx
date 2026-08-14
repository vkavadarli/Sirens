import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Playlist, Song } from '../types';
import { colors } from '../utils/colors';

interface Props {
  playlist: Playlist;
  songs: Song[];
  onPress: () => void;
  onDelete: () => void;
  onRename: () => void;
  onShare: () => void;
  isActive?: boolean;
}

export default function PlaylistCard({ playlist, songs, onPress, onDelete, onRename, onShare, isActive }: Props) {
  const count = playlist.songIds.length;

  const handleMenu = () => {
    Alert.alert(playlist.name, undefined, [
      { text: 'Yeniden Adlandır', onPress: onRename },
      { text: 'Sil', style: 'destructive', onPress: onDelete },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconBox}>
        <Ionicons name={isActive ? 'volume-high' : 'musical-notes'} size={28} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{playlist.name}</Text>
        <Text style={[styles.count, isActive && styles.activeCount]}>{isActive ? 'Şimdi çalıyor' : `${count} şarkı`}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onShare} hitSlop={8} style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMenu} hitSlop={8} style={styles.actionButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  count: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  activeCount: {
    color: colors.primary,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
  },
});
