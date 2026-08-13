import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { pickAndImportZip } from '../utils/zipImport';
import { colors } from '../utils/colors';
import SongItem from '../components/SongItem';
import { Song } from '../types';

export default function LibraryScreen() {
  const { songs, playlists, loadLibrary, addSongs, removeSong, addSongToPlaylist } = useLibraryStore();
  const { playSong, currentSong } = usePlayerStore();
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');

  useEffect(() => {
    loadLibrary();
  }, []);

  const filtered = search.trim()
    ? songs.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.artist.toLowerCase().includes(search.toLowerCase())
      )
    : songs;

  const handleImport = async () => {
    setImporting(true);
    try {
      const imported = await pickAndImportZip((current, total, name) => {
        setImportProgress(`İçe aktarılıyor ${current}/${total}: ${name}`);
      });
      if (imported.length > 0) {
        await addSongs(imported);
        Alert.alert('Tamamlandı', `${imported.length} şarkı eklendi.`);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'ZIP dosyası içe aktarılamadı.';
      Alert.alert('İçe Aktarma Hatası', message);
    } finally {
      setImporting(false);
      setImportProgress('');
    }
  };

  const handlePlay = useCallback(
    (song: Song, index: number) => {
      playSong(song, filtered, index);
    },
    [filtered]
  );

  const handleRemove = (song: Song) => {
    Alert.alert(
      'Şarkıyı Sil',
      `"${song.title}" kütüphaneden silinsin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => removeSong(song.id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kütüphane</Text>
        <TouchableOpacity style={styles.importBtn} onPress={handleImport} disabled={importing}>
          {importing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Import progress */}
      {importing && importProgress ? (
        <View style={styles.progressBar}>
          <Text style={styles.progressText} numberOfLines={1}>{importProgress}</Text>
        </View>
      ) : null}

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Şarkı veya sanatçı ara..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
          selectionColor={colors.primary}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Song count */}
      {songs.length > 0 && (
        <View style={styles.countRow}>
          <Text style={styles.countText}>{filtered.length} şarkı</Text>
          {filtered.length > 0 && (
            <TouchableOpacity
              style={styles.shuffleAll}
              onPress={() => {
                const idx = Math.floor(Math.random() * filtered.length);
                playSong(filtered[idx], filtered, idx);
              }}
            >
              <Ionicons name="shuffle" size={14} color={colors.primary} />
              <Text style={styles.shuffleText}>Karıştır</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Song list */}
      {songs.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="musical-notes-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Kütüphane Boş</Text>
          <Text style={styles.emptyText}>Müzik eklemek için sağ üstteki + butonuna bas ve ZIP dosyası seç.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          renderItem={({ item, index }) => (
            <SongItem
              song={item}
              onPress={() => handlePlay(item, index)}
              onRemove={() => handleRemove(item)}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  importBtn: {
    padding: 4,
  },
  progressBar: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.primaryGlow,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  progressText: {
    color: colors.primary,
    fontSize: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    justifyContent: 'space-between',
  },
  countText: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shuffleAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  shuffleText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 160,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
