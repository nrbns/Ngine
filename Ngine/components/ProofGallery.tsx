// Proof-of-Progress Gallery Component
// Shows evidence that goals are actually happening
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { database } from '../services/supabase';
import { colors, typography, spacing } from '../design-system';

interface GoalProof {
  id: string;
  file_url: string;
  file_type: string;
  note?: string;
  created_at: string;
}

interface ProofGalleryProps {
  resolutionId: string;
  userId: string;
}

export function ProofGallery({ resolutionId, userId }: ProofGalleryProps) {
  const [proofs, setProofs] = useState<GoalProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProofs();
  }, [resolutionId]);

  const loadProofs = async () => {
    try {
      const data = await database.getResolutionGoalProofs(resolutionId);
      setProofs(data);
    } catch (error) {
      console.error('Error loading proofs:', error);
    } finally {
      setLoading(false);
    }
  };

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
      await uploadProof(result.assets[0]);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      await uploadProof(result.assets[0]);
    }
  };

  const uploadProof = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploading(true);
    try {
      // Convert asset to file format expected by Supabase
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const file = {
        ...blob,
        fileName: `proof_${Date.now()}.jpg`,
        type: 'image/jpeg',
      };

      await database.uploadGoalProof(resolutionId, userId, file);
      await loadProofs(); // Refresh the gallery

      Alert.alert('Success', 'Proof added to your progress gallery!');
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload proof. Please try again.');
    } finally {
      setUploading(false);
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
              await database.deleteGoalProof(proofId);
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
        <Text style={styles.title}>Progress Gallery</Text>
        <TouchableOpacity
          style={[styles.addButton, uploading && styles.addButtonDisabled]}
          onPress={pickImage}
          disabled={uploading}
        >
          <Text style={styles.addButtonText}>
            {uploading ? 'Uploading...' : '+ Add Proof'}
          </Text>
        </TouchableOpacity>
      </View>

      {proofs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No proofs yet</Text>
          <Text style={styles.emptySubtext}>
            Add photos, screenshots, or documents to show your progress
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={pickImage}
          >
            <Text style={styles.emptyButtonText}>Add Your First Proof</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gallery}
        >
          {proofs.map((proof) => (
            <TouchableOpacity
              key={proof.id}
              style={styles.proofCard}
              onLongPress={() => deleteProof(proof.id)}
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.hint}>
        Long press any proof to delete it
      </Text>
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
    color: colors.darkTextSecondary,
    ...typography.body,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.darkTextSecondary,
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
  proofCard: {
    width: 120,
    height: 120,
    marginRight: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.darkSurface,
    ...colors.shadows.sm,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    color: colors.darkTextSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },  addButtonDisabled: {
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
  proofCard: {
    width: 120,
    height: 120,
    marginRight: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...colors.shadow,
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
});
