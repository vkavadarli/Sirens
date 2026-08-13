import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  StatusBar, Alert, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useLibraryStore } from '../store/useLibraryStore';
import { colors } from '../utils/colors';
import PlaylistCard from '../components/PlaylistCard';
import { RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function PlaylistsScreen() {
  const navigation = useNavigation<NavProp>();
  const { playlists, songs, createPlaylist, deletePlaylist, renamePlaylist } = useLibraryStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const openCreate = () => {
    setRenamingId(null);
    setModalInput('');
    setModalVisible(true);
  };

  const openRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setModalInput(currentName);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    const name = modalInput.trim();
    if (!name) return;
    if (renamingId) {
      await renamePlaylist(renamingId, name);
    } else {
      await createPlaylist(name);
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Playlist Sil', `"${name}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deletePlaylist(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Playlistler</Text>
        <TouchableOpacity onPress={openCreate} style={styles.addBtn}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {playlists.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="list-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Playlist Yok</Text>
          <Text style={styles.emptyText}>+ butonuna basarak yeni playlist oluştur.</Text>
          <TouchableOpacity style={styles.createBtn} onPress={openCreate}>
            <Ionicons name="add" size={18} color={colors.background} />
            <Text style={styles.createBtnText}>Playlist Oluştur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <PlaylistCard
              playlist={item}
              songs={songs}
              onPress={() => navigation.navigate('PlaylistDetail', { playlistId: item.id })}
              onDelete={() => handleDelete(item.id, item.name)}
              onRename={() => openRename(item.id, item.name)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Create/Rename Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {renamingId ? 'Playlist Yeniden Adlandır' : 'Yeni Playlist'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Playlist adı..."
              placeholderTextColor={colors.textMuted}
              value={modalInput}
              onChangeText={setModalInput}
              autoFocus
              selectionColor={colors.primary}
              onSubmitEditing={handleConfirm}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleConfirm}>
                <Text style={styles.modalConfirmText}>
                  {renamingId ? 'Kaydet' : 'Oluştur'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    padding: 4,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 160,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 40,
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
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    marginTop: 8,
  },
  createBtnText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: colors.surfaceHighlight,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});
