// Daily Check-In - REAL implementation with Supabase
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { database, subscribeToCheckins } from '../services/supabase';
import { PrimaryButton } from '../components/PrimaryButton';
import { BLOCKERS } from '../constants/blockers';
import { getStatus, CheckIn as StatusCheckIn } from '../logic/statusEngine';
import { getAIInsight, shouldTriggerAI } from '../services/ai';
import { colors, typography, spacing } from '../design-system';
import { Resolution, Checkin } from '../types';

export default function CheckInScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [done, setDone] = useState<'yes' | 'partial' | 'no' | null>(null);
  const [blocker, setBlocker] = useState<string>('');
  const [energy, setEnergy] = useState(3);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Run once when the id param changes (intentionally stable)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadResolution = React.useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Get resolution details
      const { data: resolutionData, error } = await supabase
        .from('resolutions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setResolution(resolutionData);

      // Set up real-time subscription for check-ins
      const subscription = subscribeToCheckins(id, (payload: unknown) => {
        const p = payload as Record<string, unknown>;
        console.log('New check-in:', p['new']);
        // Could update UI here if needed
      });

      return () => {
        supabase.removeChannel(subscription);
      };
    } catch (err: unknown) {
      console.error('Error loading resolution:', err);
      Alert.alert('Error', 'Failed to load resolution');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      loadResolution();
    }
  }, [id, loadResolution]);

  const submitCheckin = async () => {
    if (!done || !id) return;

    setIsSubmitting(true);
    try {
      // Create check-in
      await database.createCheckin(id, {
        execution: done,
        blocker: blocker || undefined,
        energy,
      });

      // Get all check-ins to calculate new status
      const checkins = (await database.getResolutionCheckins(id, 30)) as Checkin[];
      const statusCheckins: StatusCheckIn[] = checkins.map(ci => {
        const obj = ci as Record<string, unknown>;
        return {
          created_at: String(obj['date'] ?? obj['created_at'] ?? new Date().toISOString()),
          done: String(obj['execution'] ?? obj['done'] ?? ''),
          energy: Number(obj['energy'] ?? 0),
        } as StatusCheckIn;
      });
      const newStatus = getStatus(statusCheckins);

      // Update resolution status
      const { error: updateError } = await supabase
        .from('resolutions')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) throw updateError;

      // Trigger AI if needed
      if (shouldTriggerAI(newStatus) && resolution) {
        try {
          const insight = await getAIInsight({
            resolution: resolution.title,
            status: newStatus,
            recent_checkins: checkins.slice(0, 5),
          });
          console.log('AI Insight generated:', insight);
        } catch (aiErr: unknown) {
          console.error('AI insight failed:', aiErr);
        }
      }

      // Prompt to add proof
      Alert.alert(
        'Check-in Saved!',
        'Would you like to add proof of your progress?',
        [
          {
            text: 'Add Proof',
            onPress: () => router.replace(`/resolution?id=${id}`),
          },
          {
            text: 'Maybe Later',
            style: 'cancel',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: unknown) {
      console.error('Error saving check-in:', err);
      const error = err as Error;
      Alert.alert('Error', error?.message || 'Failed to save check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading resolution...</Text>
      </View>
    );
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {resolution && (
          <Text style={styles.resolutionTitle}>{resolution.title}</Text>
        )}

        <Text style={styles.date}>{today}</Text>

        {/* Question 1: Did you complete MDD? */}
        <View style={styles.question}>
          <Text style={styles.questionText}>Did you complete your MDD today?</Text>
          <View style={styles.options}>
            <TouchableOpacity
              style={[styles.option, done === 'yes' && styles.optionActive]}
              onPress={() => setDone('yes')}
            >
              <Text style={[styles.optionText, done === 'yes' && styles.optionTextActive]}>
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, done === 'partial' && styles.optionActive]}
              onPress={() => setDone('partial')}
            >
              <Text style={[styles.optionText, done === 'partial' && styles.optionTextActive]}>
                Partial
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, done === 'no' && styles.optionActive]}
              onPress={() => setDone('no')}
            >
              <Text style={[styles.optionText, done === 'no' && styles.optionTextActive]}>
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Question 2: Blocker */}
        {done && (
          <View style={styles.question}>
            <Text style={styles.questionText}>What blocked you?</Text>
            <View style={styles.blockerGrid}>
              {BLOCKERS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.blockerChip, blocker === b && styles.blockerChipActive]}
                  onPress={() => setBlocker(blocker === b ? '' : b)}
                >
                  <Text style={[styles.blockerText, blocker === b && styles.blockerTextActive]}>
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Question 3: Energy */}
        {done && (
          <View style={styles.question}>
            <Text style={styles.questionText}>Energy level</Text>
            <View style={styles.energyRow}>
              {[1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.energyButton, energy >= level && styles.energyButtonActive]}
                  onPress={() => setEnergy(level)}
                >
                  <Text style={[styles.energyText, energy >= level && styles.energyTextActive]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <PrimaryButton
          title="Save Check-in"
          onPress={submitCheckin}
          loading={isSubmitting}
          disabled={!done}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl + 20,
    justifyContent: 'center',
  },
  loading: {
    textAlign: 'center',
    marginTop: spacing.xxl,
    color: colors.textSecondary,
    ...typography.body,
  },
  resolutionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  date: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  question: {
    marginBottom: spacing.xl,
  },
  questionText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  option: {
    flex: 1,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  optionText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#ffffff',
  },
  blockerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  blockerChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  blockerChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  blockerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  blockerTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  energyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  energyButton: {
    flex: 1,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  energyButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  energyText: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  energyTextActive: {
    color: '#ffffff',
  },
});

// Add missing import
import { supabase } from '../services/supabase';