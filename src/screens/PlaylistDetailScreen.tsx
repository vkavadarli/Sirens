import React, { useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { colors } from '../utils/colors';
import SongItem from '../components/SongItem';
import { RootStackParamList, Song } from '../types';

type RouteT = RouteProp<RootStackParamList, 'PlaylistDetail'>;

export default function PlaylistDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteT>();
  const { playlistId } = route.params;

  const { songs, playlists, removeSongFromPlaylist } = useLibraryStore();
  const { playSong, currentSong, setPersistentTabBarVisible } = usePlayerStore();

  useFocusEffect(useCallback(() => {
    setPersistentTabBarVisible(true);
    return () => setPersistentTabBarVisible(false);
  }, [setPersistentTabBarVisible]));

  const playlist = playlists.find((p) => p.id === playlistId);
  const playlistSongs = playlist
    ? (playlist.songIds.map((id) => songs.find((s) => s.id === id)).filter(Boolean) as Song[])
    : [];

  const handlePlay = useCallback(
    (song: Song, index: number) => {
      playSong(song, playlistSongs, index, playlistId);
    },
    [playlistSongs]
  );

  const handleRemove = (song: Song) => {
    Alert.alert(
      'Listeden Çıkar',
      `"${song.title}" bu playlistten çıkarılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkar',
          style: 'destructive',
          onPress: () => removeSongFromPlaylist(song.id, playlistId),
        },
      ]
    );
  };

  if (!playlist) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Playlist bulunamadı.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{playlist.name}</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Playlist info */}
      <View style={styles.info}>
        <View style={styles.artBox}>
          <Ionicons name="musical-notes" size={36} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.playlistName}>{playlist.name}</Text>
          <Text style={styles.songCount}>{playlistSongs.length} şarkı</Text>
        </View>
      </View>

      {playlistSongs.length > 0 && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => playSong(playlistSongs[0], playlistSongs, 0, playlistId)}
          >
            <Ionicons name="play" size={18} color="#000" />
            <Text style={styles.playBtnText}>Oynat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shuffleBtn}
            onPress={() => {
              const idx = Math.floor(Math.random() * playlistSongs.length);
              playSong(playlistSongs[idx], playlistSongs, idx, playlistId);
            }}
          >
            <Ionicons name="shuffle" size={18} color={colors.primary} />
            <Text style={styles.shuffleBtnText}>Karıştır</Text>
          </TouchableOpacity>
        </View>
      )}

      {playlistSongs.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="musical-notes-outline" size={56} color={colors.textMuted} />
          <Text style={styles.emptyText}>Bu listede şarkı yok.</Text>
          <Text style={styles.emptySubText}>Kütüphaneden şarkı ekleyebilirsin.</Text>
        </View>
      ) : (
        <FlatList
          data={playlistSongs}
          keyExtractor={(s) => s.id}
          renderItem={({ item, index }) => (
            <SongItem
              song={item}
              onPress={() => handlePlay(item, index)}
              onRemove={() => handleRemove(item)}
              showMenu
              isActive={currentSong?.id === item.id}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  artBox: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  playlistName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  songCount: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  playBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    gap: 8,
  },
  playBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  shuffleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryGlow,
    borderRadius: 25,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  shuffleBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  list: {
    paddingBottom: 160,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  notFound: {
    color: colors.text,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
