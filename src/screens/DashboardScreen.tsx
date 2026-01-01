import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, callEdgeFunction } from '../config/supabase';
import { Resolution } from '../types';
import { getStatusEmoji, getStatusColor, getStatusLabel } from '../utils/status';

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
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/create-resolution')}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    marginTop: 48,
    color: '#6b7280',
  },
  empty: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusEmoji: {
    fontSize: 24,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  checkinButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkinButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  adSlot: {
    height: 100,
    backgroundColor: '#e5e7eb',
    margin: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});

