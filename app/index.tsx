// Minimal Home-first implementation focused on daily check-in and ad moment
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, signInAnonymously, database, isSupabaseConfigured } from '../services/supabase';
import { colors, typography, spacing } from '../design-system';
import { DashboardAd } from '../services/ads';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todayResolution, setTodayResolution] = useState<Record<string, unknown> | null>(null);
  const [dailyDone, setDailyDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Ensure we have an authenticated session (anonymous fallback)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (isSupabaseConfigured()) {
            await signInAnonymously();
          } else {
            // running in mock mode, continue without backend
          }
        }

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser && authUser.id) {
          setUserId(authUser.id);

          const resolutions = await database.getUserResolutions(authUser.id);
          const today = new Date().toISOString().split('T')[0];
          const active = (resolutions || []).find((r: Record<string, unknown>) => String(r['start_date'] ?? '') && String(r['end_date'] ?? '') && (today >= String(r['start_date']) && today <= String(r['end_date'])));
          if (active) {
            setTodayResolution(active);
            // determine if a checkin exists for today
            const checkins = await database.getResolutionCheckins(String(active['id']), 1);
            if (checkins && checkins.length > 0) setDailyDone(true);
          }
        }
      } catch (err) {
        console.error('Home load error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const doCheckin = async (choice: 'yes' | 'partial' | 'no') => {
    if (!todayResolution) {
      Alert.alert('No active resolution', 'Create a resolution to start your daily check-in.', [
        { text: 'Create', onPress: () => router.push('/create') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (dailyDone) {
      Alert.alert('Already checked in', 'You have already checked in for today. Come back tomorrow.');
      return;
    }

    setSubmitting(true);
    try {
      await database.createCheckin(todayResolution.id, { execution: choice, energy: 3 });
      setDailyDone(true);
      // show a friendly confirmation
      Alert.alert('Nice!', 'You showed up today — great job!', [{ text: 'Close' }]);
    } catch (err) {
      console.error('Check-in failed', err);
      Alert.alert('Error', 'Failed to record check-in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.subtitle}>{todayResolution ? todayResolution.title : 'No active resolution today'}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{todayResolution ? 'Today\'s check-in' : 'Start a Resolution'}</Text>
        <Text style={styles.cardHint}>{todayResolution ? 'Takes 10 seconds — pick Yes, Partial, or No' : 'Create a resolution to begin your daily habit'}</Text>

        {todayResolution ? (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.btn, styles.btnYes]} onPress={() => doCheckin('yes')} disabled={submitting || dailyDone}>
              <Text style={styles.btnText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPartial]} onPress={() => doCheckin('partial')} disabled={submitting || dailyDone}>
              <Text style={styles.btnText}>Partial</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnNo]} onPress={() => doCheckin('no')} disabled={submitting || dailyDone}>
              <Text style={styles.btnText}>No</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.createBtn]} onPress={() => router.push('/create')}>
            <Text style={styles.btnText}>Create Resolution</Text>
          </TouchableOpacity>
        )}

        {dailyDone && (
          <Text style={styles.cheer}>You showed up — reset tomorrow ✅</Text>
        )}
      </View>

      {/* Banner ad placement (non-intrusive) */}
      <View style={styles.adSlot}>
        <DashboardAd />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'flex-start',
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.xl,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.darkSurface,
    padding: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  cardHint: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnYes: { backgroundColor: '#10b981' },
  btnPartial: { backgroundColor: '#f59e0b' },
  btnNo: { backgroundColor: '#ef4444' },
  createBtn: { backgroundColor: colors.accent },
  btnText: { color: '#ffffff', fontWeight: '700' },
  cheer: { marginTop: spacing.md, color: colors.textPrimary, fontWeight: '600' },
  adSlot: { marginTop: spacing.lg },
});