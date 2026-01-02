// Resolution End Summary Screen
// Optional rewarded ad here
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../services/supabase';
import { showRewardedAd } from '../services/ads';
import { getAIInsight } from '../services/ai';

export default function SummaryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [resolution, setResolution] = useState<import('../types').Resolution | null>(null);
  const [checkins, setCheckins] = useState<import('../types').Checkin[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const loadData = React.useCallback(async () => {
    const { data: resData } = await supabase
      .from('resolutions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (resData) setResolution(resData);

    const { data: checkinData } = await supabase
      .from('checkins')
      .select('*')
      .eq('resolution_id', id)
      .order('created_at', { ascending: true });
    
    if (checkinData) setCheckins(checkinData);
  }, [id]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  const loadAIInsight = async () => {
    setLoadingInsight(true);
    try {
      const watched = await showRewardedAd();
      if (watched) {
        const insight = await getAIInsight({
          resolution: resolution?.title,
          checkins: checkins.slice(-10),
          outcome: calculateOutcome(),
        });
        setAiInsight(insight);
      }
    } catch (err: unknown) {
      console.error('Error loading AI insight:', err);
    } finally {
      setLoadingInsight(false);
    }
  };

  const calculateOutcome = (): string => {
    const executedDays = checkins.filter(c => c.done === 'yes').length;
    const totalDays = checkins.length;
    const rate = executedDays / Math.max(1, totalDays);

    if (rate >= 0.8) return 'Achieved';
    if (rate >= 0.5) return 'Partial';
    return 'Abandoned';
  };

  if (!resolution) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  const outcome = calculateOutcome();
  const executedDays = checkins.filter(c => c.done === 'yes').length;
  const totalDays = checkins.length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Resolution Summary</Text>
        <Text style={styles.resolutionTitle}>{resolution.title}</Text>

        <View style={styles.outcomeBox}>
          <Text style={styles.outcomeLabel}>Outcome</Text>
          <Text style={styles.outcomeValue}>{outcome}</Text>
        </View>

        <View style={styles.statsBox}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{executedDays}</Text>
            <Text style={styles.statLabel}>Days Executed</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalDays}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {Math.round((executedDays / Math.max(1, totalDays)) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        {aiInsight ? (
          <View style={styles.insightBox}>
            <Text style={styles.insightTitle}>AI Insight</Text>
            <Text style={styles.insightText}>{aiInsight}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.insightButton}
            onPress={loadAIInsight}
            disabled={loadingInsight}
          >
            <Text style={styles.insightButtonText}>
              {loadingInsight ? 'Loading...' : 'Watch Ad for AI Insight'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
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
    padding: 16,
  },
  loading: {
    textAlign: 'center',
    marginTop: 48,
    color: '#6b7280',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  resolutionTitle: {
    fontSize: 20,
    color: '#6b7280',
    marginBottom: 24,
  },
  outcomeBox: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  outcomeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  outcomeValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  statsBox: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  insightBox: {
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 16,
    color: '#1e40af',
    lineHeight: 24,
  },
  insightButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  insightButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});

