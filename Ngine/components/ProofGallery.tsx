// Proof-of-Progress Gallery Component
// Shows evidence that goals are actually happening
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, Modal, TextInput, Pressable, Platform, LayoutAnimation, UIManager, Animated, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database, subscribeToGoalProofs, supabase } from '../services/supabase';
import Toast from './Toast';
import { colors, typography, spacing } from '../design-system';

// Minimal ambient declaration so TypeScript knows about process.env in this environment.
// This avoids needing @types/node while keeping the checks safe for Expo / React Native.
declare const process: {
  env?: {
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_KEY?: string;
  };
};

const isSupabaseConfigured = () => !!(
  process?.env?.EXPO_PUBLIC_SUPABASE_URL &&
  process?.env?.EXPO_PUBLIC_SUPABASE_KEY &&
  !process?.env?.EXPO_PUBLIC_SUPABASE_URL?.includes('your_supabase') &&
  !process?.env?.EXPO_PUBLIC_SUPABASE_KEY?.includes('your_supabase')
);

// Enable LayoutAnimation on Android for smooth list insert/removal animations
if (Platform.OS === 'android' && UIManager && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const MOCK_PROOFS_KEY = (resolutionId: string) => `mock_proofs_${resolutionId}`;

interface GoalProof {
  id: string;
  file_url: string;
  file_type: string;
  note?: string;
  created_at: string;
}

interface MinimalDB {
  getResolutionGoalProofs: (resolutionId: string, limit?: number) => Promise<GoalProof[]>;
  uploadGoalProof: (resolutionId: string, userId: string, file: unknown, note?: string) => Promise<GoalProof | Record<string, unknown>>;
  deleteGoalProof: (proofId: string) => Promise<void>;
}

interface ProofGalleryProps {
  resolutionId: string;
  userId: string;
  db?: MinimalDB; // optional injectable database for tests or advanced usage
}

export function ProofGallery({ resolutionId, userId, db }: ProofGalleryProps) {
  const dbClient = db ?? database;

  const [proofs, setProofs] = useState<GoalProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Realtime indicators
  const [live, setLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setToastMessage(null);
    }, 3000);
  };

  // Note modal state
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [pickedAsset, setPickedAsset] = useState<ImagePicker.ImagePickerAsset | undefined>(undefined);
  const [note, setNote] = useState('');

  // Animated values for modals
  const [modalOpacity] = useState(() => new Animated.Value(0));
  React.useEffect(() => {
    Animated.timing(modalOpacity, { toValue: noteModalVisible ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [noteModalVisible, modalOpacity]);

  // Viewer state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewedProof, setViewedProof] = useState<GoalProof | null>(null);

  const loadProofs = React.useCallback(async () => {    try {
      if (!isSupabaseConfigured()) {
        // Load from AsyncStorage mock
        const raw = await AsyncStorage.getItem(MOCK_PROOFS_KEY(resolutionId));
        const items = raw ? JSON.parse(raw) : [];
        setProofs(items);
        return;
      }

      const data = await dbClient.getResolutionGoalProofs(resolutionId);
      setProofs(data);
    } catch (error) {
      console.error('Error loading proofs:', error);
    } finally {
      setLoading(false);
    }
  }, [resolutionId, dbClient]);

  React.useEffect(() => {
    loadProofs();

    // Realtime updates for goal proofs when running with Supabase
    let subscription: ReturnType<typeof subscribeToGoalProofs> | null = null;
    if (isSupabaseConfigured()) {
      try {
        subscription = subscribeToGoalProofs(resolutionId, (payload: unknown) => {
          // payload.eventType will be 'INSERT'|'UPDATE'|'DELETE'
                try { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); } catch (err) { console.warn('Layout animation failed', err); }

          // mark live and set timestamp
          setLive(true);
          setLastUpdate(new Date().toISOString());

          const p = parsePayload(payload);
          if (p.eventType === 'INSERT' && p.new) {
            setProofs((prev) => [p.new!, ...prev]);
            showToast('New proof added');
          } else if (p.eventType === 'DELETE' && p.old) {
            setProofs((prev) => prev.filter((q) => q.id !== p.old!.id));
            showToast('Proof deleted');
          } else if (p.eventType === 'UPDATE' && p.new) {
            setProofs((prev) => prev.map((q) => (q.id === p.new!.id ? p.new! : q)));
            showToast('Proof updated');
          } else {
            // fallback: reload proofs on other events
            loadProofs();
          }
        });

        // Subscription established
        setLive(true);
      } catch (e) {
        console.warn('Realtime goal_proofs subscription failed', e);
      }
    } else {
      setLive(false);
    }

    return () => {
      if (subscription) {
        try { supabase.removeChannel(subscription); } catch (err) { console.warn('Failed to remove subscription', err); }
      }
      setLive(false);
    };
  }, [loadProofs, resolutionId]);

  // Render Toast
  <></>; // placeholder to keep linter happy (Toast rendered below)

  // Safe payload accessor
  function parsePayload(payload: unknown): { eventType?: string; new?: GoalProof; old?: GoalProof } {
    const p = payload as Record<string, unknown>;
    return {
      eventType: String(p.eventType ?? p.event ?? ''),
      new: (p.new ?? p['new']) as GoalProof | undefined,
      old: (p.old ?? p['old']) as GoalProof | undefined,
    };
  }

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add proofs.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Add Proof',
      'Choose how to add your proof of progress',
      [
        {
          text: 'Take Photo',
          onPress: () => openCamera(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // After picking an asset, prompt for an optional note before uploading
  const handlePickedAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    setPickedAsset(asset);
    setNote('');
    setNoteModalVisible(true);
  };


  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      await handlePickedAsset(result.assets[0]);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      await handlePickedAsset(result.assets[0]);
    }
  };

  const uploadProof = async (asset: ImagePicker.ImagePickerAsset, note?: string) => {
    setUploading(true);
    try {
      if (!isSupabaseConfigured()) {
        // Simulate upload by storing locally and using local URI
        const mock = {
          id: `mock_${Date.now()}`,
          file_url: asset.uri,
          file_type: 'image',
          note: note || undefined,
          created_at: new Date().toISOString(),
        } as GoalProof;

        const raw = await AsyncStorage.getItem(MOCK_PROOFS_KEY(resolutionId));
        const items = raw ? JSON.parse(raw) : [];
        items.unshift(mock);
        await AsyncStorage.setItem(MOCK_PROOFS_KEY(resolutionId), JSON.stringify(items));

        // Animate layout change for a smooth insertion
        try { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); } catch (err) { console.warn('Layout animation failed', err); }
        setProofs(items);

        Alert.alert('Simulated upload', 'Proof added locally (Supabase not configured).');
        return;
      }

      // Convert asset to file format expected by Supabase
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const file = {
        ...blob,
        fileName: `proof_${Date.now()}.jpg`,
        type: 'image/jpeg',
      };

      await dbClient.uploadGoalProof(resolutionId, userId, file, note);
      await loadProofs(); // Refresh the gallery

      Alert.alert('Success', 'Proof added to your progress gallery!');
    } catch (error: unknown) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload proof. Please try again.');
    } finally {
      setUploading(false);
      setNoteModalVisible(false);
      setPickedAsset(undefined);
    }
  };

  const deleteProof = async (proofId: string) => {
    Alert.alert(
      'Delete Proof',
      'Are you sure you want to delete this proof?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!isSupabaseConfigured()) {
                const raw = await AsyncStorage.getItem(MOCK_PROOFS_KEY(resolutionId));
                const items: GoalProof[] = raw ? JSON.parse(raw) : [];
                const remaining = items.filter((p: GoalProof) => p.id !== proofId);
                await AsyncStorage.setItem(MOCK_PROOFS_KEY(resolutionId), JSON.stringify(remaining));
                setProofs(remaining);
                return;
              }

              await dbClient.deleteGoalProof(proofId);
              await loadProofs();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete proof.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading gallery...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Progress Gallery</Text>
          <Text style={styles.cloudStatus}>
            {isSupabaseConfigured() ? 'Cloud: Connected' : 'Storage: Local (mock)'}
            {live ? ' • Live' : ''}
            {lastUpdate ? ` • Updated ${new Date(lastUpdate).toLocaleTimeString()}` : ''}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addButton, uploading && styles.addButtonDisabled, pressed && { opacity: 0.9 }]}
          onPress={pickImage}
          disabled={uploading}
        >
          <Text style={styles.addButtonText}>
            {uploading ? 'Uploading...' : '+ Add Proof'}
          </Text>
        </Pressable>
      </View>

      {proofs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No proofs yet</Text>
          <Text style={styles.emptySubtext}>
            Add photos, screenshots, or documents to show your progress
          </Text>
          <Pressable
            style={({ pressed }) => [styles.emptyButton, pressed && { opacity: 0.9 }]}
            onPress={pickImage}
          >
            <Text style={styles.emptyButtonText}>Add Your First Proof</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.grid}>
          {proofs.map((proof) => (
            <Pressable
              key={proof.id}
              style={({ pressed }) => [
                styles.proofCard,
                pressed && styles.proofCardPressed,
              ]}
              onPress={() => {
                setViewedProof(proof);
                setViewerVisible(true);
              }}
              onLongPress={() => deleteProof(proof.id)}
              testID={`proof-${proof.id}`}
            >
              <Image
                source={{ uri: proof.file_url }}
                style={styles.proofImage}
                resizeMode="cover"
              />
              <View style={styles.proofOverlay}>
                <Text style={styles.proofDate}>{formatDate(proof.created_at)}</Text>
                {proof.note && (
                  <Text style={styles.proofNote} numberOfLines={2}>
                    {proof.note}
                  </Text>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.hint}>
        Long press any proof to delete it
      </Text>

      {/* Toast */}
      <Toast message={toastMessage} visible={toastVisible} />

      {/* Note Modal */}
      <Modal visible={noteModalVisible} transparent animationType="none">
        <View style={styles.modalBackdrop}>
          <Animated.View style={[styles.modalCard, { opacity: modalOpacity, transform: [{ scale: modalOpacity.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }] }]}>
            <Text style={styles.modalTitle}>Add a note (optional)</Text>
            <TextInput
              testID="input-proof-note"
              style={styles.modalInput}
              placeholder="Add a short note about this proof"
              placeholderTextColor="#9ca3af"
              value={note}
              onChangeText={setNote}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalButton} onPress={() => { setNoteModalVisible(false); setPickedAsset(undefined); }}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable testID="btn-upload-proof" style={[styles.modalButton, styles.modalPrimary]} onPress={() => pickedAsset && uploadProof(pickedAsset, note)}>
                <Text style={[styles.modalButtonText, styles.modalPrimaryText]}>{uploading ? 'Uploading...' : 'Upload'}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Viewer Modal */}
      <Modal visible={viewerVisible} transparent animationType="fade">
        <View style={styles.viewerBackdrop}>
          <Pressable style={styles.viewerClose} onPress={() => setViewerVisible(false)}>
            <Text style={styles.viewerCloseText}>Close</Text>
          </Pressable>
          {viewedProof && (
            <Image source={{ uri: viewedProof.file_url }} style={styles.viewerImage} resizeMode="contain" />
          )}
          {viewedProof?.note && (
            <View style={styles.viewerNoteCard}>
              <Text style={styles.viewerNoteText}>{viewedProof.note}</Text>
            </View>
          )}
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.darkBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.darkTextPrimary,
  },
  cloudStatus: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 4,
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    ...typography.bodySmall,
    color: '#ffffff',
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    color: colors.textSecondary,
    ...typography.body,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  emptyButtonText: {
    ...typography.body,
    color: '#ffffff',
    fontWeight: '600',
  },
  gallery: {
    paddingVertical: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  proofCard: {
    width: 120,
    height: 120,
    marginRight: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  proofImage: {
    width: '100%',
    height: '100%',
  },
  proofOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: spacing.sm,
  },
  proofDate: {
    ...typography.caption,
    color: '#ffffff',
    fontWeight: '600',
  },
  proofNote: {
    ...typography.caption,
    color: '#ffffff',
    marginTop: 2,
  },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    backgroundColor: colors.darkSurface,
    borderRadius: 12,
    padding: spacing.md,
    // subtle elevation for modal
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.darkTextPrimary,
    marginBottom: spacing.sm,
  },
  modalInput: {
    backgroundColor: '#2b3f50',
    color: '#ffffff',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  modalButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#3c5266',
  },
  modalPrimary: {
    backgroundColor: colors.accent,
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  modalPrimaryText: {
    color: '#ffffff',
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proofCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.98,
  },
  viewerImage: {
    width: '90%',
    height: '70%',
    marginBottom: spacing.md,
  },
  viewerNoteCard: {
    padding: spacing.sm,
    backgroundColor: '#2b3f50',
    borderRadius: 8,
  },
  viewerNoteText: {
    color: '#ffffff',
  },
  viewerClose: {
    position: 'absolute',
    top: 48,
    right: 24,
  },
  viewerCloseText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
