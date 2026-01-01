import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../config/supabase';
import { SupportStyle } from '../types';

export default function CreateResolutionScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [why, setWhy] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [mddValue, setMddValue] = useState(5);
  const [supportStyle, setSupportStyle] = useState<SupportStyle>('gentle');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
        return;
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + durationDays);

      const { error } = await supabase
        .from('resolutions')
        .insert({
          user_id: user.id,
          title: title.trim(),
          why: why.trim() || null,
          duration_days: durationDays,
          mdd_text: `${mddValue} days per week`,
          mdd_value: mddValue,
          support_style: supportStyle,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'aligned',
        })
        .select()
        .single();

      if (error) throw error;

      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      console.error('Error creating resolution:', error);
      alert(error.message || 'Failed to create resolution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Resolution Contract</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Title *</Text>
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
          <Text style={styles.label}>Duration</Text>
          <View style={styles.durationButtons}>
            {[7, 14, 30, 60].map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.durationButton,
                  durationDays === days && styles.durationButtonActive,
                ]}
                onPress={() => setDurationDays(days)}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    durationDays === days && styles.durationButtonTextActive,
                  ]}
                >
                  {days} days
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
              setMddValue(Math.max(1, Math.min(7, val)));
            }}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Support Style</Text>
          <View style={styles.supportButtons}>
            {(['strict', 'logical', 'gentle'] as SupportStyle[]).map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.supportButton,
                  supportStyle === style && styles.supportButtonActive,
                ]}
                onPress={() => setSupportStyle(style)}
              >
                <Text
                  style={[
                    styles.supportButtonText,
                    supportStyle === style && styles.supportButtonTextActive,
                  ]}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading || !title.trim()}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Save Resolution'}
          </Text>
        </TouchableOpacity>
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
    padding: 24,
  },
  title: {
    fontSize: 32,
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
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

