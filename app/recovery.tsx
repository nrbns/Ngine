// Recovery Mode - Safe Space
// Softer colors, short text, no metrics, no pressure
// This is why users won't uninstall
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../services/supabase';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, typography, spacing } from '../design-system';

export default function RecoveryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [resolution, setResolution] = useState<import('../types').Resolution | null>(null);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadResolution = React.useCallback(async () => {
    const { data } = await supabase
      .from('resolutions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) setResolution(data);
  }, [id]);

  useEffect(() => {
    if (id) {
      loadResolution();
    }
  }, [id, loadResolution]);

  const startRecovery = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const recoveryEndDate = new Date();
      recoveryEndDate.setDate(recoveryEndDate.getDate() + 3);

      await supabase
        .from('resolutions')
        .update({
          status: 'recovering',
          recovery_start_date: new Date().toISOString().split('T')[0],
          recovery_end_date: recoveryEndDate.toISOString().split('T')[0],
        })
        .eq('id', id);

      router.back();
    } catch (err: unknown) {
      console.error('Error starting recovery:', err);
      const error = err as Error;
      alert(error?.message || 'Failed to start recovery');
    } finally {
      setLoading(false);
    }
  };

  if (!resolution) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Recovery Mode</Text>
        <Text style={styles.subtitle}>Reset without guilt</Text>

        <View style={styles.messageBox}>
          <Text style={styles.message}>
            Your resolution {resolution.title} needs attention.
          </Text>
          <Text style={styles.message}>
            Recovery mode gives you a fresh start with a 3-day micro plan focusing only on your MDD.
          </Text>
        </View>

        <View style={styles.planBox}>
          <Text style={styles.planTitle}>3-Day Recovery Plan</Text>
          <Text style={styles.planItem}>Focus on MDD only</Text>
          <Text style={styles.planItem}>Small wins matter</Text>
          <Text style={styles.planItem}>Gentle reminders</Text>
          <Text style={styles.planItem}>No judgment</Text>
        </View>

        <PrimaryButton
          title="Start Recovery"
          onPress={startRecovery}
          loading={loading}
        />

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa', // Softer background
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl + 20,
  },
  loading: {
    textAlign: 'center',
    marginTop: spacing.xxl,
    color: colors.textSecondary,
    ...typography.body,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  messageBox: {
    backgroundColor: '#fef3c7', // Softer yellow
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  message: {
    ...typography.body,
    color: '#92400e',
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  planBox: {
    backgroundColor: '#f3f4f6',
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xl,
  },
  planTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  planItem: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cancelButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
