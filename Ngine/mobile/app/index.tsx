// Life Dashboard - Production Grade
// Single vertical narrative, not card jungle
// Calm, honest, intentional, serious
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';
import { DashboardAd } from '../services/ads';
import { getStatus } from '../logic/statusEngine';
import { calculateIntegrityScore, getIntegrityLabel, getIntegrityColor, ResolutionData } from '../logic/integrity';
import { getDailyReflection } from '../services/reflection';
import { colors, typography, spacing } from '../design-system';

interface Resolution {
  id: string;
  title: string;
  status: string;
  aim_id?: string;
  start_date: string;
  end_date: string;
  checkins?: any[];
}

interface Aim {
  id: string;
  title: string;
  resolutions?: Resolution[];
}

export default function LifeDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [aims, setAims] = useState<Aim[]>([]);
  const [todayResolutions, setTodayResolutions] = useState<Resolution[]>([]);
  const [integrityScore, setIntegrityScore] = useState(0);
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.replace('/profile');
        return;
      }

      // Load user profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      setUser(userData);

      // Load aims
      const { data: aimsData } = await supabase
        .from('aims')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: true });

      // Load resolutions
      const today = new Date().toISOString().split('T')[0];
      const { data: resolutionsData } = await supabase
        .from('resolutions')
        .select('*')
        .eq('user_id', authUser.id)
        .gte('end_date', today)
        .order('created_at', { ascending: false });

      const resolutionsWithCheckins = await Promise.all(
        (resolutionsData || []).map(async (resolution) => {
          const { data: checkins } = await supabase
            .from('checkins')
            .select('*')
            .eq('resolution_id', resolution.id)
            .order('date', { ascending: false });

          const status = getStatus(checkins || []);
          return {
            ...resolution,
            status,
            checkins: checkins || [],
          };
        })
      );

      // Filter today's resolutions
      const today = new Date().toISOString().split('T')[0];
      const todayRes = resolutionsWithCheckins.filter(r => 
        today >= r.start_date && today <= r.end_date
      );
      setTodayResolutions(todayRes);

      // Calculate integrity score
      const resolutionData: ResolutionData[] = resolutionsWithCheckins.map(r => ({
        id: r.id,
        status: r.status,
        checkins: r.checkins || [],
        mdd_value: r.mdd_value || parseInt(r.mdd) || 5,
        duration: r.duration,
        start_date: r.start_date,
      }));
      const score = calculateIntegrityScore(resolutionData);
      setIntegrityScore(score);

      // Load daily reflection
      try {
        const reflectionText = await getDailyReflection(authUser.id);
        setReflection(reflectionText);
      } catch (error) {
        console.error('Error loading reflection:', error);
      }

      // Group resolutions by aim
      const aimsWithResolutions = (aimsData || []).map(aim => ({
        ...aim,
        resolutions: resolutionsWithCheckins.filter(r => r.aim_id === aim.id),
      }));
      setAims(aimsWithResolutions);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const calculateAimProgress = (aimResolutions: Resolution[]): number => {
    if (aimResolutions.length === 0) return 0;
    const alignedCount = aimResolutions.filter(r => r.status === 'aligned').length;
    return Math.round((alignedCount / aimResolutions.length) * 100);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusEmoji = (status: string) => {
    const emojis: Record<string, string> = {
      aligned: '🟢',
      drifting: '🟡',
      broken: '🔴',
      recovering: '🔵',
    };
    return emojis[status] || '🟢';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* A. Identity Header - Very Important */}
      <View style={styles.identityHeader}>
        <Text style={styles.greeting}>
          {getGreeting()}, {user?.alias || user?.name || 'there'}
        </Text>
        {user?.core_identity && (
          <Text style={styles.identityStatement}>
            You are becoming: {user.core_identity}
          </Text>
        )}
      </View>

      {/* B. Life Aims - Compact, Meaningful */}
      {aims.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Aims</Text>
          {aims.map((aim) => {
            const progress = calculateAimProgress(aim.resolutions || []);
            return (
              <TouchableOpacity
                key={aim.id}
                style={styles.aimRow}
                onPress={() => router.push('/aims')}
              >
                <Text style={styles.aimBullet}>●</Text>
                <Text style={styles.aimTitle}>{aim.title}</Text>
                <View style={styles.aimProgressContainer}>
                  <View style={styles.aimProgressBar}>
                    <View
                      style={[
                        styles.aimProgressFill,
                        { width: `${progress}%`, backgroundColor: getIntegrityColor(progress) },
                      ]}
                    />
                  </View>
                  <Text style={styles.aimProgressText}>{progress}%</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* C. Today's Execution - Core Action */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Today</Text>
        {todayResolutions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active resolutions today</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/create')}
            >
              <Text style={styles.createButtonText}>Create Resolution</Text>
            </TouchableOpacity>
          </View>
        ) : (
          todayResolutions.map((resolution) => (
            <TouchableOpacity
              key={resolution.id}
              style={styles.executionRow}
              onPress={() => router.push(`/checkin?id=${resolution.id}`)}
            >
              <Text style={styles.executionTitle}>{resolution.title}</Text>
              <Text style={styles.executionStatus}>
                {getStatusEmoji(resolution.status)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* D. Integrity Meter - Truth Indicator */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Execution Integrity</Text>
        <View style={styles.integrityContainer}>
          <View style={styles.integrityMeter}>
            <View style={styles.integrityBar}>
              <View
                style={[
                  styles.integrityFill,
                  {
                    width: `${integrityScore}%`,
                    backgroundColor: getIntegrityColor(integrityScore),
                  },
                ]}
              />
            </View>
            <Text style={styles.integrityScore}>{integrityScore}%</Text>
          </View>
          <Text style={styles.integrityLabel}>
            {getIntegrityLabel(integrityScore)}
          </Text>
        </View>
      </View>

      {/* E. Insight - Rules / AI */}
      {reflection && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Insight</Text>
          <Text style={styles.insightText}>{reflection}</Text>
        </View>
      )}

      {/* F. Single Native Ad - Only Here, Very Subtle */}
      <View style={styles.adContainer}>
        <DashboardAd />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    textAlign: 'center',
    marginTop: spacing.xxl,
    color: colors.textSecondary,
    ...typography.body,
  },
  identityHeader: {
    padding: spacing.lg,
    paddingTop: spacing.xxl + 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  identityStatement: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionLabel: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  aimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  aimBullet: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  aimTitle: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  aimProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: 80,
  },
  aimProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  aimProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  aimProgressText: {
    ...typography.caption,
    color: colors.textSecondary,
    minWidth: 35,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  createButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  createButtonText: {
    ...typography.bodySmall,
    color: '#ffffff',
    fontWeight: '600',
  },
  executionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  executionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  executionStatus: {
    fontSize: 20,
  },
  integrityContainer: {
    gap: spacing.sm,
  },
  integrityMeter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  integrityBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  integrityFill: {
    height: '100%',
    borderRadius: 4,
  },
  integrityScore: {
    ...typography.h2,
    color: colors.textPrimary,
    minWidth: 50,
  },
  integrityLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  insightText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  adContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
});
