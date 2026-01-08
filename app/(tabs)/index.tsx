import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase, Resolution, ngineChannel } from '../../lib/supabase'
// Import ads component - it handles web platform internally
import { BannerAdComponent } from '../../lib/ads'
import { GoalCard } from '../../components/GoalCard'
import { IdentityHeader } from '../../components/IdentityHeader'

export default function HomeScreen() {
  const router = useRouter()
  const [goal, setGoal] = useState<Resolution | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadGoal()

    // Real-time updates (only if Supabase is configured)
    if (process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      try {
        const channel = ngineChannel
          .on('postgres_changes',
            { event: '*', table: 'resolutions' },
            () => loadGoal()
          )
          .on('postgres_changes',
            { event: '*', table: 'checkins' },
            () => loadGoal()
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (error) {
        console.warn('Real-time subscription error:', error)
      }
    }
  }, [])

  const loadGoal = async () => {
    try {
      // Check if Supabase is configured
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        console.warn('Supabase not configured - using offline mode')
        setLoading(false)
        return
      }

      let { data: { user } } = await supabase.auth.getUser()
      
      // Auto sign-in anonymously if no user
      if (!user) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
          if (authError) {
            console.error('Error signing in anonymously:', authError)
            setLoading(false)
            return
          }
          user = authData.user
        } catch (authErr) {
          console.error('Auth error:', authErr)
          setLoading(false)
          return
        }
      }

      if (!user) {
        setLoading(false)
        return
      }

      // Get active goal (most recent)
      const { data, error } = await supabase
        .from('resolutions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is fine
        console.error('Error loading goal:', error)
      } else {
        setGoal(data || null)
      }
    } catch (error) {
      console.error('Error loading goal:', error)
      // Don't crash the app, just show empty state
    } finally {
      setLoading(false)
    }
  }

  const handleCheckin = (status: 'yes' | 'partial' | 'no') => {
    if (!goal) {
      Alert.alert('No Goal', 'Create a goal first to start checking in.', [
        { text: 'Create Goal', onPress: () => router.push('/create-goal') },
        { text: 'Cancel', style: 'cancel' }
      ])
      return
    }

    router.push({
      pathname: '/checkin',
      params: { goalId: goal.id, status }
    })
  }

  // Error fallback
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null)
              setLoading(true)
              loadGoal()
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading your day...</Text>
        </View>
      </SafeAreaView>
    )
  }

  try {
    return (
      <SafeAreaView style={styles.container}>
        <IdentityHeader />

      <View style={styles.content}>
        {goal ? (
          <>
            <GoalCard goal={goal} />

            <View style={styles.checkinSection}>
              <Text style={styles.question}>Did you show up today?</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.checkinButton, styles.doneButton]}
                  onPress={() => handleCheckin('yes')}
                >
                  <Text style={styles.checkinButtonText}>✅ Done</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.checkinButton, styles.partialButton]}
                  onPress={() => handleCheckin('partial')}
                >
                  <Text style={styles.checkinButtonText}>🟡 Partial</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.checkinButton, styles.missedButton]}
                  onPress={() => handleCheckin('no')}
                >
                  <Text style={styles.checkinButtonText}>❌ Missed</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No active goal</Text>
            <Text style={styles.emptySubtitle}>
              Create your first goal to start building consistency
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/create-goal')}
            >
              <Text style={styles.createButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Banner Ad - Safe earning placement */}
      <View style={styles.adContainer}>
        <BannerAdComponent />
      </View>
    </SafeAreaView>
    )
  } catch (renderError: any) {
    console.error('Render error:', renderError)
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Render Error</Text>
          <Text style={styles.errorText}>{renderError?.message || 'Unknown error'}</Text>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  checkinSection: {
    marginBottom: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  checkinButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  doneButton: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  partialButton: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  missedButton: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  checkinButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  adContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
})
