import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { colors } from '../utils/colors';
import SongItem from '../components/SongItem';
import { Song } from '../types';

export default function SearchScreen() {
  const { songs, playlists, addSongToPlaylist, removeSong } = useLibraryStore();
  const { playSong, currentSong } = usePlayerStore();
  const [query, setQuery] = useState('');

  const results = query.trim()
    ? songs.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.artist.toLowerCase().includes(query.toLowerCase()) ||
          s.album.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ara</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Şarkı, sanatçı veya albüm..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          selectionColor={colors.primary}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {query.trim().length === 0 ? (
        <View style={styles.hint}>
          <Ionicons name="search-outline" size={56} color={colors.textMuted} />
          <Text style={styles.hintText}>Aramak istediğin şarkıyı yaz</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.hint}>
          <Ionicons name="musical-note-outline" size={56} color={colors.textMuted} />
          <Text style={styles.hintText}>Sonuç bulunamadı</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(s) => s.id}
          renderItem={({ item, index }) => (
            <SongItem
              song={item}
              onPress={() => playSong(item, results, index)}
              onRemove={() => removeSong(item.id)}
              playlists={playlists}
              onAddToPlaylist={(pid) => addSongToPlaylist(item.id, pid)}
              showMenu
              isActive={currentSong?.id === item.id}
            />
          )}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  list: {
    paddingBottom: 160,
  },
  hint: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
});
