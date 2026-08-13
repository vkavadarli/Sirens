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
}

export default function PlaylistCard({ playlist, songs, onPress, onDelete, onRename }: Props) {
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
        <Ionicons name="musical-notes" size={28} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{playlist.name}</Text>
        <Text style={styles.count}>{count} şarkı</Text>
      </View>
      <TouchableOpacity onPress={handleMenu} hitSlop={8}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textMuted} />
      </TouchableOpacity>
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
});
