import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { callEdgeFunction } from '../config/supabase';
import { CheckInStatus } from '../types';

const BLOCKERS = [
  'Lack of time',
  'Low energy',
  'Lost motivation',
  'Unexpected event',
  'Other',
];

export default function CheckInScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [execution, setExecution] = useState<CheckInStatus | null>(null);
  const [blocker, setBlocker] = useState<string>('');
  const [energy, setEnergy] = useState(3);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const dateLabel = new Date(today).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSubmit = async () => {
    if (!execution) return;

    // Confirm submission
    Alert.alert(
      'Submit Check-in',
      'Are you sure you want to submit this check-in?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setLoading(true);
            try {
              await callEdgeFunction('checkin', {
                resolution_id: id,
                date: today,
                execution,
                blocker: blocker || null,
                energy,
              });

              Alert.alert('Saved', 'Check-in saved successfully');
              router.back();
            } catch (error: any) {
              console.error('Error saving check-in:', error);
              Alert.alert('Error', error.message || 'Failed to save check-in');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Daily Check-in</Text>
        <Text style={styles.date}>{dateLabel}</Text>

        <View style={styles.section}>
          <Text style={styles.question}>Did you complete your MDD today?</Text>
          <View style={styles.executionButtons}>
            <TouchableOpacity
              testID="btn-exec-yes"
              style={[
                styles.executionButton,
                execution === 'yes' && styles.executionButtonActive,
              ]}
              onPress={() => setExecution('yes')}
            >
              <Text style={styles.executionEmoji}>✅</Text>
              <Text
                style={[
                  styles.executionText,
                  execution === 'yes' && styles.executionTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity> 

            <TouchableOpacity
              testID="btn-exec-partial"
              style={[
                styles.executionButton,
                execution === 'partial' && styles.executionButtonActive,
              ]}
              onPress={() => setExecution('partial')}
            >
              <Text style={styles.executionEmoji}>⚠️</Text>
              <Text
                style={[
                  styles.executionText,
                  execution === 'partial' && styles.executionTextActive,
                ]}
              >
                Partial
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="btn-exec-no"
              style={[
                styles.executionButton,
                execution === 'no' && styles.executionButtonActive,
              ]}
              onPress={() => setExecution('no')}
            >
              <Text style={styles.executionEmoji}>❌</Text>
              <Text
                style={[
                  styles.executionText,
                  execution === 'no' && styles.executionTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.executionButton,
                execution === 'partial' && styles.executionButtonActive,
              ]}
              onPress={() => setExecution('partial')}
            >
              <Text style={styles.executionEmoji}>⚠️</Text>
              <Text
                style={[
                  styles.executionText,
                  execution === 'partial' && styles.executionTextActive,
                ]}
              >
                Partial
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.executionButton,
                execution === 'no' && styles.executionButtonActive,
              ]}
              onPress={() => setExecution('no')}
            >
              <Text style={styles.executionEmoji}>❌</Text>
              <Text
                style={[
                  styles.executionText,
                  execution === 'no' && styles.executionTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {execution && (
          <>
            <View style={styles.section}>
              <Text style={styles.question}>What blocked you? (optional)</Text>
              <View style={styles.blockerButtons}>
                {BLOCKERS.map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[
                      styles.blockerButton,
                      blocker === b && styles.blockerButtonActive,
                    ]}
                    onPress={() => setBlocker(blocker === b ? '' : b)}
                  >
                    <Text
                      style={[
                        styles.blockerText,
                        blocker === b && styles.blockerTextActive,
                      ]}
                    >
                      {b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.question}>Energy Level: {energy}/5</Text>
              <View style={styles.energyContainer}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.energyButton,
                      energy >= level && styles.energyButtonActive,
                    ]}
                    onPress={() => setEnergy(level)}
                  >
                    <Text
                      style={[
                        styles.energyText,
                        energy >= level && styles.energyTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <TouchableOpacity
          testID="submit-button"
          style={[styles.submitButton, (!execution || loading) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!execution || loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving...' : 'Save Check-in'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#3c5266',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  date: {
    fontSize: 16,
    color: '#bfc9cf',
    marginBottom: 12,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ecf0f1',
    marginBottom: 16,
  },
  executionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  executionButton: {
    flex: 1,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2b3f50',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#2b3f50',
  },
  executionButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  executionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  executionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#bfc9cf',
  },
  executionTextActive: {
    color: '#ffffff',
  },
  blockerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  blockerButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#2b3f50',
    borderRadius: 8,
  },
  blockerButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  blockerText: {
    fontSize: 14,
    color: '#bfc9cf',
  },
  blockerTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  energyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  energyButton: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2b3f50',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  energyButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  energyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#bfc9cf',
  },
  energyTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

