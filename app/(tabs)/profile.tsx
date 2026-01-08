import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function ProfileScreen() {
  const [identity, setIdentity] = useState('You are becoming disciplined.')
  const [daysCheckedIn, setDaysCheckedIn] = useState(0)
  const [resets, setResets] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    try {
      let { data: { user } } = await supabase.auth.getUser()
      
      // Auto sign-in anonymously if no user
      if (!user) {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
        if (authError) {
          console.error('Error signing in anonymously:', authError)
          setLoading(false)
          return
        }
        user = authData.user
      }

      if (!user) {
        setLoading(false)
        return
      }

      // Load user identity
      const { data: userData } = await supabase
        .from('profiles')
        .select('identity')
        .eq('id', user.id)
        .single()

      if (userData?.identity) {
        setIdentity(userData.identity)
      }

      // Load check-in stats
      const { data: resolutions } = await supabase
        .from('resolutions')
        .select('id')
        .eq('user_id', user.id)

      if (resolutions && resolutions.length > 0) {
        const resolutionIds = resolutions.map(r => r.id)

        const { data: checkins } = await supabase
          .from('checkins')
          .select('execution, created_at')
          .in('resolution_id', resolutionIds)

        if (checkins) {
          setDaysCheckedIn(checkins.length)

          // Count resets (simplified - consecutive yes after misses)
          let resetCount = 0
          let hadMiss = false

          // Sort by date and count resets
          const sortedCheckins = checkins.sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )

          for (const checkin of sortedCheckins) {
            if (checkin.execution !== 'yes') {
              hadMiss = true
            } else if (hadMiss) {
              resetCount++
              hadMiss = false
            }
          }

          setResets(resetCount)
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text>Loading progress...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Progress</Text>

        <View style={styles.identityCard}>
          <Text style={styles.identityText}>{identity}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{daysCheckedIn}</Text>
            <Text style={styles.statLabel}>Days checked in</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{resets}</Text>
            <Text style={styles.statLabel}>Resets overcome</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 40,
  },
  identityCard: {
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  identityText: {
    fontSize: 20,
    color: '#111827',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 28,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
})
