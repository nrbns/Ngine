import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import ThemeProvider from '../components/ThemeProvider';
import { colors, spacing } from '../../design-system';
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
    backgroundColor: '#2c3e50', // Dark navy background like mockup
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#34495e',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    marginTop: 48,
    color: '#ecf0f1',
  },
  empty: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#ecf0f1',
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
    backgroundColor: '#3c5266', // Card background from mockup
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  statusEmoji: {
    fontSize: 20,
  },
  statusLabel: {
    fontSize: 13,
    color: '#bdc3c7',
    marginBottom: 12,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 11,
    color: '#95a5a6',
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
    fontSize: 15,
    fontWeight: '600',
  },
  adSlot: {
    height: 80,
    backgroundColor: '#34495e',
    margin: 16,
    marginTop: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adText: {
    color: '#7f8c8d',
    fontSize: 12,
  },
});

