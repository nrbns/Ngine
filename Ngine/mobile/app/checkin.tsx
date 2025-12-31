// Daily Check-In - Sacred Screen
// White background, no ads, no icons, no scroll
// Three questions. Done.
// Must feel SERIOUS
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../services/supabase';
import { PrimaryButton } from '../components/PrimaryButton';
import { BLOCKERS } from '../constants/blockers';
import { getStatus } from '../logic/statusEngine';
import { getAIInsight, shouldTriggerAI } from '../services/ai';
import { colors, typography, spacing } from '../design-system';

export default function CheckInScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [done, setDone] = useState<'yes' | 'partial' | 'no' | null>(null);
  const [blocker, setBlocker] = useState<string>('');
  const [energy, setEnergy] = useState(3);
  const [loading, setLoading] = useState(false);
  const [resolution, setResolution] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadResolution();
    }
  }, [id]);

  const loadResolution = async () => {
    const { data } = await supabase
      .from('resolutions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) setResolution(data);
  };

  const submitCheckin = async () => {
    if (!done || !id) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      await supabase
        .from('checkins')
        .upsert({
          resolution_id: id,
          date: today,
          execution: done,
          blocker: blocker || null,
          energy,
        }, {
          onConflict: 'resolution_id,date'
        });

      const { data: checkins } = await supabase
        .from('checkins')
        .select('*')
        .eq('resolution_id', id)
        .order('date', { ascending: false });

      const newStatus = getStatus(checkins || []);

      await supabase
        .from('resolutions')
        .update({ status: newStatus })
        .eq('id', id);

      if (shouldTriggerAI(newStatus) && resolution) {
        getAIInsight({
          resolution: resolution.title,
          status: newStatus,
          recent_checkins: checkins?.slice(0, 5) || [],
        }).catch(console.error);
      }

      router.back();
    } catch (error: any) {
      console.error('Error saving check-in:', error);
      alert(error.message || 'Failed to save check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {resolution && (
          <Text style={styles.resolutionTitle}>{resolution.title}</Text>
        )}

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
          title="Save"
          onPress={submitCheckin}
          loading={loading}
          disabled={!done}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // White background
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl + 20,
    justifyContent: 'center',
  },
  resolutionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
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
