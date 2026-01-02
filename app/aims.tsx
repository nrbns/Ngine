// Life Aims Screen
// Long-term direction (3-5 aims)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';

import { supabase } from '../services/supabase';
import { PrimaryButton } from '../components/PrimaryButton';

interface Aim {
  id: string;
  title: string;
  description?: string;
}

export default function AimsScreen() {
  const [aims, setAims] = useState<Aim[]>([]);
  const [editingAim, setEditingAim] = useState<Aim | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAims();
  }, []);

  const loadAims = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('aims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAims(data || []);
    } catch (error) {
      console.error('Error loading aims:', error);
    }
  };

  const saveAim = async () => {
    if (!title.trim()) {
      alert('Please enter an aim title');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in');
        return;
      }

      if (editingAim) {
        const { error } = await supabase
          .from('aims')
          .update({
            title: title.trim(),
            description: description.trim() || null,
          })
          .eq('id', editingAim.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('aims')
          .insert({
            user_id: user.id,
            title: title.trim(),
            description: description.trim() || null,
          });

        if (error) throw error;
      }

      setTitle('');
      setDescription('');
      setEditingAim(null);
      loadAims();
    } catch (err: unknown) {
      console.error('Error saving aim:', err);
      const error = err as Error;
      alert(error?.message || 'Failed to save aim');
    } finally {
      setLoading(false);
    }
  };

  const deleteAim = async (id: string) => {
    try {
      const { error } = await supabase
        .from('aims')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadAims();
    } catch (err: unknown) {
      console.error('Error deleting aim:', err);
      const error = err as Error;
      alert(error?.message || 'Failed to delete aim');
    }
  };

  const startEdit = (aim: Aim) => {
    setEditingAim(aim);
    setTitle(aim.title);
    setDescription(aim.description || '');
  };

  const cancelEdit = () => {
    setEditingAim(null);
    setTitle('');
    setDescription('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>My Aims</Text>
        <Text style={styles.subtitle}>Long-term direction (3-5 aims)</Text>

        {aims.map((aim) => (
          <View key={aim.id} style={styles.aimCard}>
            <View style={styles.aimHeader}>
              <Text style={styles.aimTitle}>{aim.title}</Text>
              <View style={styles.aimActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => startEdit(aim)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    if (confirm('Delete this aim?')) {
                      deleteAim(aim.id);
                    }
                  }}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            {aim.description && (
              <Text style={styles.aimDescription}>{aim.description}</Text>
            )}
          </View>
        ))}

        <View style={styles.formSection}>
          <Text style={styles.formTitle}>
            {editingAim ? 'Edit Aim' : 'Add New Aim'}
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Aim Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Become physically disciplined"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Why this matters to you"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formActions}>
            <PrimaryButton
              title={editingAim ? 'Update Aim' : 'Add Aim'}
              onPress={saveAim}
              loading={loading}
              disabled={!title.trim()}
            />
            {editingAim && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {aims.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Add 3-5 life aims to give your resolutions meaning and direction.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  aimCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  aimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  aimTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  aimActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#ef4444',
  },
  aimDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    gap: 12,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

