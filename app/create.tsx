// Create Resolution Screen (Connected to Aim)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';
import { PrimaryButton } from '../components/PrimaryButton';

interface Aim {
  id: string;
  title: string;
}

export default function CreateResolution() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [why, setWhy] = useState('');
  const [duration, setDuration] = useState(30);
  const [mddValue, setMddValue] = useState(5);
  const [support, setSupport] = useState<'strict' | 'logical' | 'gentle'>('gentle');
  const [aimId, setAimId] = useState<string>('');
  const [aims, setAims] = useState<Aim[]>([]);
  const [loading, setLoading] = useState(false);

  // Load aims once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadAims = React.useCallback(async () => {
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
      if (data && data.length > 0 && !aimId) {
        setAimId(data[0].id); // Default to first aim
      }
    } catch (error) {
      console.error('Error loading aims:', error);
    }
  }, [aimId]);

  useEffect(() => {
    loadAims();
  }, [loadAims]);

  const createResolution = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Handle anonymous user or redirect to auth
        alert('Please sign in');
        return;
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + duration);

      const { error } = await supabase
        .from('resolutions')
        .insert({
          user_id: user.id,
          aim_id: aimId || null,
          title: title.trim(),
          why: why.trim() || null,
          duration,
          mdd: `${mddValue} days per week`,
          mdd_value: mddValue,
          support,
          status: 'aligned',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      router.back();
    } catch (err: unknown) {
      console.error('Error creating resolution:', err);
      const error = err as Error;
      alert(error?.message || 'Failed to create resolution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Resolution</Text>

        {aims.length > 0 && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Linked Aim *</Text>
            <View style={styles.aimButtons}>
              {aims.map((aim) => (
                <TouchableOpacity
                  key={aim.id}
                  style={[
                    styles.aimButton,
                    aimId === aim.id && styles.aimButtonActive,
                  ]}
                  onPress={() => setAimId(aim.id)}
                >
                  <Text
                    style={[
                      styles.aimButtonText,
                      aimId === aim.id && styles.aimButtonTextActive,
                    ]}
                  >
                    {aim.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/aims')}
            >
              <Text style={styles.linkButtonText}>+ Manage Aims</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Resolution Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Exercise daily"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Why it matters</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={why}
            onChangeText={setWhy}
            placeholder="Why is this important to you?"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Duration (days)</Text>
          <View style={styles.durationButtons}>
            {[7, 14, 30, 60].map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.durationButton,
                  duration === days && styles.durationButtonActive,
                ]}
                onPress={() => setDuration(days)}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    duration === days && styles.durationButtonTextActive,
                  ]}
                >
                  {days}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Minimum Daily Discipline (MDD): {mddValue} days/week
          </Text>
          <TextInput
            style={styles.input}
            value={mddValue.toString()}
            onChangeText={(text) => {
              const val = parseInt(text) || 1;
              const clamped = Math.max(1, Math.min(7, val));
              setMddValue(clamped);

            }}
            keyboardType="number-pad"
            placeholder="Days per week (1-7)"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Support Style</Text>
          <View style={styles.supportButtons}>
            {(['strict', 'logical', 'gentle'] as const).map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.supportButton,
                  support === style && styles.supportButtonActive,
                ]}
                onPress={() => setSupport(style)}
              >
                <Text
                  style={[
                    styles.supportButtonText,
                    support === style && styles.supportButtonTextActive,
                  ]}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <PrimaryButton
          title="Create Resolution"
          onPress={createResolution}
          loading={loading}
          disabled={!title.trim()}
        />
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
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 24,
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
  durationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  durationButtonTextActive: {
    color: '#ffffff',
  },
  supportButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  supportButton: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  supportButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  supportButtonTextActive: {
    color: '#ffffff',
  },
  aimButtons: {
    gap: 8,
  },
  aimButton: {
    padding: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  aimButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  aimButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  aimButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 8,
    padding: 8,
  },
  linkButtonText: {
    fontSize: 14,
    color: '#3b82f6',
  },
});

