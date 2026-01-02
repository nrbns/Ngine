// Resolution Detail Screen - Shows execution timeline and proof gallery
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, database, subscribeToCheckins } from '../services/supabase';
import { ProofGallery } from '../components/ProofGallery';
import { getStatus, calculateSuccessProbability } from '../logic/statusEngine';
import { colors, typography, spacing } from '../design-system';

interface Resolution {
  id: string;
  title: string;
  why?: string;
  aim_id?: string;
  mdd: string;
  mdd_value: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface CheckIn {
  id: string;
  date: string;
  execution: string;
  blocker?: string;
  energy: number;
  created_at: string;
}

export default function ResolutionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [aim, setAim] = useState<any>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [liveCheckins, setLiveCheckins] = useState(false);
  const [lastCheckinUpdate, setLastCheckinUpdate] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any | null = null;
    if (id) {
      loadResolution();

      // Subscribe to checkins for real-time updates
      try {
        subscription = subscribeToCheckins(id, (payload: any) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setCheckins((prev) => [payload.new, ...prev]);
            setLastCheckinUpdate(new Date().toISOString());
            setLiveCheckins(true);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setCheckins((prev) => prev.filter((c) => c.id !== payload.old.id));
            setLastCheckinUpdate(new Date().toISOString());
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setCheckins((prev) => prev.map((c) => (c.id === payload.new.id ? payload.new : c)));
            setLastCheckinUpdate(new Date().toISOString());
          } else {
            // fallback: refresh full list
            loadResolution();
          }
        });

        setLiveCheckins(true);
      } catch (e) {
        console.warn('Failed to subscribe to checkins', e);
      }
    }

    return () => {
      if (subscription) {
        try { supabase.removeChannel(subscription); } catch (e) {}
      }
    };
  }, [id]);

  const loadResolution = async () => {
    if (!id) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      setUser(authUser);

      // Get resolution with aim
      const { data: resolutionData } = await supabase
        .from('resolutions')
        .select(`
          *,
          aims!inner(title)
        `)
        .eq('id', id)
        .single();

      if (resolutionData) {
        setResolution(resolutionData);
        setAim(resolutionData.aims);
      }

      // Get check-ins
      const checkinsData = await database.getResolutionCheckins(id, 30);
      setCheckins(checkinsData);

    } catch (error: any) {
      console.error('Error loading resolution:', error);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getExecutionText = (execution: string) => {
    switch (execution) {
      case 'yes': return 'Completed';
      case 'partial': return 'Partial';
      case 'no': return 'Missed';
      default: return execution;
    }
  };

  const getExecutionColor = (execution: string) => {
    switch (execution) {
      case 'yes': return '#10b981';
      case 'partial': return '#f59e0b';
      case 'no': return '#ef4444';
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading resolution...</Text>
      </View>
    );
  }

  if (!resolution) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Resolution not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Goal Identity */}
      <View style={styles.section}>
        <Text style={styles.title}>{resolution.title}</Text>

        {aim && (
          <View style={styles.aimBadge}>
            <Text style={styles.aimLabel}>Part of: {aim.title}</Text>
          </View>
        )}

        {resolution.why && (
          <Text style={styles.why}>{resolution.why}</Text>
        )}
      </View>

      {/* Today's Reality */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <View style={styles.statusCard}>
          <Text style={styles.statusEmoji}>{getStatusEmoji(resolution.status)}</Text>
          <View style={styles.statusInfo}>
            <Text style={styles.statusText}>{resolution.status.toUpperCase()}</Text>
            <Text style={styles.mddText}>MDD: {resolution.mdd}</Text>
            <Text style={{ ...typography.caption, color: colors.textTertiary, marginTop: 6 }}>
              {liveCheckins ? `Live · Updated ${lastCheckinUpdate ? new Date(lastCheckinUpdate).toLocaleTimeString() : ''}` : 'Live updates: off'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkinButton}
            onPress={() => router.push(`/checkin?id=${resolution.id}`)}
          >
            <Text style={styles.checkinButtonText}>Check In</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Proof Gallery */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Gallery</Text>
        {user && (
          <View style={{ marginTop: 8 }}>
            <ProofGallery
              resolutionId={resolution.id}
              userId={user.id}
            />
          </View>
        )}
      </View>

      {/* Execution Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Execution Timeline</Text>

        {checkins.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No check-ins yet</Text>
            <Text style={styles.emptySubtext}>Start checking in to build your execution history</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {checkins.map((checkin, index) => (
              <View key={checkin.id} style={styles.timelineItem}>
                <View style={styles.timelineLine}>
                  {index < checkins.length - 1 && <View style={styles.timelineConnector} />}
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineDate}>{formatDate(checkin.date)}</Text>
                    <View style={styles.executionBadge}>
                      <Text
                        style={[
                          styles.executionText,
                          { color: getExecutionColor(checkin.execution) },
                        ]}
                      >
                        {getExecutionText(checkin.execution)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.timelineDetails}>
                    <Text style={styles.energyText}>Energy: {checkin.energy}/5</Text>
                    {checkin.blocker && (
                      <Text style={styles.blockerText}>Blocker: {checkin.blocker}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const shadow = {
  // cross-platform shadow for cards
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.12,
  shadowRadius: 4,
};

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
  error: {
    textAlign: 'center',
    marginTop: spacing.xxl,
    color: colors.statusBroken,
    ...typography.body,
  },
  section: {
    padding: spacing.lg,
    // Use card style
    backgroundColor: colors.darkSurface,
    marginHorizontal: 16,
    marginBottom: spacing.md,
    borderRadius: 12,
  },
  title: {
    ...typography.h1,
    color: colors.darkTextPrimary,
    marginBottom: spacing.sm,
  },
  aimBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  aimLabel: {
    ...typography.caption,
    color: '#ffffff',
    fontWeight: '600',
  },
  why: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    ...shadow,
  },
  statusEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  mddText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  checkinButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  checkinButtonText: {
    ...typography.bodySmall,
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  timeline: {
    gap: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineLine: {
    width: 20,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timelineConnector: {
    width: 2,
    height: 40,
    backgroundColor: colors.border,
    marginTop: 20,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    ...shadow,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timelineDate: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  executionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  executionText: {
    ...typography.caption,
    fontWeight: '600',
  },
  timelineDetails: {
    gap: spacing.xs,
  },
  energyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  blockerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
