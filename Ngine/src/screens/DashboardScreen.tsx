import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import ThemeProvider from '../components/ThemeProvider';
import IntegrityMeter from '../components/IntegrityMeter';
import EnvBanner from '../components/EnvBanner';
import { colors, typography, spacing, borderRadius } from '../../design-system';
import { useRouter } from 'expo-router';
import { callEdgeFunction } from '../config/supabase';
import { Resolution } from '../types';
import { getStatusEmoji, getStatusLabel } from '../utils/status';

export default function DashboardScreen() {
  const router = useRouter();
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const { data, error } = await callEdgeFunction('dashboard', {});
      if (error) throw error;
      setResolutions(data.resolutions || []);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const todayResolution = resolutions.find(r => {
    const today = new Date().toISOString().split('T')[0];
    return today >= r.start_date && today <= r.end_date;
  });

  return (
    <ThemeProvider>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Life Dashboard</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/create-resolution')}
          >
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>

        <EnvBanner />

        {/* Integrity Meter */}
        <IntegrityMeter resolutions={resolutions} />

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : resolutions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No resolutions yet</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/create-resolution')}
          >
            <Text style={styles.emptyButtonText}>Create Your First Resolution</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {todayResolution && (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/checkin/${todayResolution.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{todayResolution.title}</Text>
                <Text style={styles.statusEmoji}>
                  {getStatusEmoji(todayResolution.status)}
                </Text>
              </View>
              <Text style={styles.statusLabel}>
                {getStatusLabel(todayResolution.status)}
              </Text>
              <View style={styles.cardStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {todayResolution.success_probability || 0}%
                  </Text>
                  <Text style={styles.statLabel}>Success Probability</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {todayResolution.days_remaining || 0}
                  </Text>
                  <Text style={styles.statLabel}>Days Remaining</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.checkinButton}
                onPress={() => router.push(`/checkin/${todayResolution.id}`)}
              >
                <Text style={styles.checkinButtonText}>Daily Check-in</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          {resolutions.filter(r => r.id !== todayResolution?.id).map((resolution) => (
            <TouchableOpacity
              key={resolution.id}
              style={styles.card}
              onPress={() => router.push(`/resolution/${resolution.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{resolution.title}</Text>
                <Text style={styles.statusEmoji}>
                  {getStatusEmoji(resolution.status)}
                </Text>
              </View>
              <Text style={styles.statusLabel}>
                {getStatusLabel(resolution.status)}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Ad slot placeholder */}
          <View style={styles.adSlot}>
            <Text style={styles.adText}>Ad Space</Text>
          </View>
        </>
      )}
      </ScrollView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl + 8,
    backgroundColor: colors.darkSurface,
  },
  title: {
    ...typography.h2,
    color: colors.darkTextPrimary,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    marginTop: spacing.xl,
    color: colors.darkTextSecondary,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: colors.darkTextSecondary,
    marginBottom: spacing.sm,
  },
  emptyButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.darkSurface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkTextPrimary,
    flex: 1,
  },
  statusEmoji: {
    fontSize: 20,
  },
  statusLabel: {
    fontSize: 13,
    color: colors.darkTextSecondary,
    marginBottom: spacing.md,
  },
  cardStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  checkinButton: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  checkinButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  adSlot: {
    height: 80,
    backgroundColor: colors.darkSurface,
    margin: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adText: {
    color: colors.textTertiary,
    fontSize: 12,
  },
});

