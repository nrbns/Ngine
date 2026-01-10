import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { supabase } from '../lib/api/supabase'
import { useNgineStore } from '../lib/store'
import { TactileButton } from '../components'
import { generateRecoveryMessage } from '../lib/utils/ai-motivation'
import { COLORS } from '../lib/config/colors'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../lib/config/design-tokens'
import Animated, { FadeInUp } from 'react-native-reanimated'

export default function RecoveryScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [recoveryMessage, setRecoveryMessage] = useState('You didn\'t fail. Reset tomorrow.')
  const [subMessage, setSubMessage] = useState('Every expert was once a beginner. Every champion was once defeated. This is just part of the journey.')
  const activeResolution = useNgineStore((state) => state.activeResolution)
  const setActiveResolution = useNgineStore((state) => state.setActiveResolution)

  // Generate AI recovery message on mount
  useEffect(() => {
    const generateRecovery = async () => {
      if (!activeResolution) return

      try {
        // Get recent check-ins to determine days missed
        const { data: checkins } = await supabase
          .from('checkins')
          .select('*')
          .eq('resolution_id', activeResolution.id)
          .order('date', { ascending: false })
          .limit(10)

        // Calculate days missed and previous streak
        const today = new Date().toISOString().split('T')[0]
        const hasTodayCheckin = checkins?.some(c => c.date === today)
        const yesCheckins = checkins?.filter(c => c.execution === 'yes') || []
        const previousStreak = yesCheckins.length
        const daysMissed = hasTodayCheckin ? 0 : 1 // Approximate

        const message = generateRecoveryMessage(
          daysMissed,
          previousStreak,
          activeResolution.title
        )

        setRecoveryMessage(message)
        setSubMessage('Recovery is part of the process. What matters is that you return stronger.')
      } catch (error) {
        console.error('Error generating recovery message:', error)
      }
    }

    generateRecovery()
  }, [activeResolution])

  const handleReset = async () => {
    if (!activeResolution) {
      router.replace('/(tabs)')
      return
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setLoading(true)

    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
      if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' || supabaseUrl.includes('placeholder')) {
        Alert.alert(
          'Supabase Not Configured',
          'Reset functionality requires Supabase. For now, you can continue tracking tomorrow.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        )
        return
      }

      let { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const { data: authData } = await supabase.auth.signInAnonymously()
        user = authData?.user || null
      }

      if (!user) {
        Alert.alert('Error', 'Unable to authenticate. Please try again.')
        setLoading(false)
        return
      }

      // Update resolution status to paused (soft reset) or keep active
      // For now, we'll just navigate back - the user can start fresh tomorrow
      // In future, could add a "reset_date" field to track resets

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300))
      
      router.replace('/(tabs)')
    } catch (error) {
      console.error('Error in recovery reset:', error)
      Alert.alert('Error', 'Failed to reset. Please try again.')
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        entering={FadeInUp.duration(200)}
        style={styles.content}
      >
        <Text style={styles.title}>Recovery Mode</Text>

        <Animated.View 
          entering={FadeInUp.duration(200).delay(50)}
          style={styles.messageCard}
        >
          <Text style={styles.message}>
            {recoveryMessage}
          </Text>
          <Text style={styles.subMessage}>
            {subMessage}
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(200).delay(100)}
          style={styles.buttonContainer}
        >
          <TactileButton
            label={loading ? 'Resetting...' : 'Reset Tomorrow'}
            onPress={handleReset}
            variant="done"
            disabled={loading}
          />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.screen,
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.greeting,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xl * 2,
  },
  messageCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.card + SPACING.md,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: SPACING.xl * 2,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  message: {
    ...TYPOGRAPHY.goalTitle,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subMessage: {
    ...TYPOGRAPHY.goalMdd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: SPACING.lg,
  },
})

