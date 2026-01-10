import React, { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Animated, { withSpring, useSharedValue, useAnimatedStyle, FadeInUp } from 'react-native-reanimated'
import { notificationAsync, selectionAsync, NotificationFeedbackType } from '../lib/utils/haptics'
import { supabase } from '../lib/api/supabase'
import { generateCheckinMotivation } from '../lib/utils/ai-motivation'
import { COLORS } from '../lib/config/colors'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../lib/config/design-tokens'

export default function CheckInScreen() {
  const router = useRouter()
  const { goalId, status } = useLocalSearchParams<{ goalId: string; status: string }>()
  const [energy, setEnergy] = useState<number | null>(null)
  const [blocker, setBlocker] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Animation for energy chips - create individual shared values
  const chip1Scale = useSharedValue(1)
  const chip2Scale = useSharedValue(1)
  const chip3Scale = useSharedValue(1)
  const chip4Scale = useSharedValue(1)
  const chip5Scale = useSharedValue(1)
  
  const getChipScale = (level: number) => {
    switch(level) {
      case 1: return chip1Scale
      case 2: return chip2Scale
      case 3: return chip3Scale
      case 4: return chip4Scale
      case 5: return chip5Scale
      default: return chip1Scale
    }
  }
  
  const getChipAnimatedStyle = (level: number) => {
    const scale = getChipScale(level)
    return useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }))
  }

  const submitCheckin = async () => {
    if (!goalId || !status) return

      if (energy === null) {
      notificationAsync(NotificationFeedbackType.Error)
      Alert.alert('Missing Energy', 'Please select your energy level.')
      return
    }

    setLoading(true)

    try {
      let { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
        if (authError) {
          Alert.alert('Error', 'Failed to authenticate. Please try again.')
          setLoading(false)
          return
        }
        user = authData.user
      }

      if (!user) {
        Alert.alert('Error', 'Unable to save check-in. Please try again.')
        setLoading(false)
        return
      }

      const today = new Date().toISOString().split('T')[0]

      // Check if Supabase is configured
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
      if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' || supabaseUrl.includes('placeholder')) {
        Alert.alert(
          'Supabase Not Configured',
          'Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in your .env file.',
          [{ text: 'OK' }]
        )
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('checkins')
        .insert({
          resolution_id: goalId,
          date: today,
          execution: status,
          energy: energy || null, // Allow null if somehow energy is 0
          blocker: blocker.trim() || null,
        })
        .select()
        .single()

      if (error) {
        console.error('Check-in insert error:', error)
        console.error('Error code:', error.code)
        console.error('Error details:', error.details)
        
        let errorMessage = error.message || 'Failed to save check-in'
        if (error.code === '42501') {
          errorMessage = 'Permission denied. Please check your Supabase RLS policies.'
        } else if (error.code === '23505') {
          errorMessage = 'You have already checked in today.'
        } else if (error.code === '23503') {
          errorMessage = 'Goal not found. Please create a goal first.'
        }
        
        throw new Error(errorMessage)
      }

      // 300ms delay for perceived processing
      await new Promise(resolve => setTimeout(resolve, 300))

      notificationAsync(NotificationFeedbackType.Success)
      
      // Generate AI motivational message based on check-in
      try {
        // Get goal for context
        const { data: goalData } = await supabase
          .from('resolutions')
          .select('*')
          .eq('id', goalId)
          .single()
        
        // Get current streak for context
        const { data: recentCheckins } = await supabase
          .from('checkins')
          .select('*')
          .eq('resolution_id', goalId)
          .eq('execution', 'yes')
          .order('date', { ascending: false })
        
        const streak = recentCheckins?.length || 0
        
        const motivation = generateCheckinMotivation(
          status as 'yes' | 'partial' | 'no',
          streak,
          goalData?.title,
          energy
        )
        
        // Show motivational alert, then navigate
        Alert.alert(
          '✅ Check-in Complete',
          motivation,
          [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
        )
      } catch (motivationError) {
        // If motivation generation fails, just navigate
        console.error('Error generating motivation:', motivationError)
        router.replace('/(tabs)')
      }
    } catch (err: unknown) {
      console.error('Error saving check-in:', err)
      const error = err as Error
      Alert.alert('Error', error?.message || 'Failed to save check-in')
      setLoading(false)
      
      // Error handled, loading state reset
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Question Text */}
        <Animated.View entering={FadeInUp.duration(200)}>
          <Text style={styles.question}>Did you show up today?</Text>
        </Animated.View>

        {/* ENERGY SELECTOR */}
        <Animated.View entering={FadeInUp.delay(80).duration(200)} style={styles.energySection}>
          <Text style={styles.energyLabel}>Energy Level</Text>
          <View style={styles.energyChips}>
            {[1, 2, 3, 4, 5].map((level, index) => {
              const scale = getChipScale(level)
              const chipStyle = useAnimatedStyle(() => ({
                transform: [{ scale: scale.value }],
              }))
              
              return (
                <Animated.View
                  key={level}
                  entering={FadeInUp.delay(100 + index * 50).duration(250)}
                >
                  <Pressable
                    onPress={() => {
                      selectionAsync()
                      setEnergy(level)
                      scale.value = withSpring(1.15, {}, () => {
                        scale.value = withSpring(1)
                      })
                    }}
                  >
                    <Animated.View
                      style={[
                        styles.energyChip,
                        chipStyle,
                        {
                          backgroundColor: energy === level ? COLORS.primary : COLORS.card,
                          borderColor: energy === level ? COLORS.primary : COLORS.border + '60',
                        },
                        energy === level ? SHADOWS.primary : SHADOWS.sm,
                      ]}
                    >
                      <Text style={[
                        styles.energyChipText,
                        { color: energy === level ? COLORS.textPrimary : COLORS.textSecondary }
                      ]}>
                        {level}
                      </Text>
                    </Animated.View>
                  </Pressable>
                </Animated.View>
              )
            })}
          </View>
        </Animated.View>

        {/* Optional Input */}
        <Animated.View entering={FadeInUp.delay(160).duration(200)} style={styles.inputSection}>
          <TextInput
            style={styles.input}
            value={blocker}
            onChangeText={setBlocker}
            placeholder="What blocked you? (optional)"
            placeholderTextColor={COLORS.textTertiary}
            multiline={false}
          />
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Confirm Button */}
        <Animated.View entering={FadeInUp.delay(240).duration(200)}>
        <Pressable
          onPress={submitCheckin}
          disabled={loading || energy === null}
          style={[
            styles.confirmButton,
            {
              backgroundColor: energy ? COLORS.primary : COLORS.card,
              opacity: energy ? 1 : 0.6,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.text} size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>CONFIRM</Text>
          )}
        </Pressable>
        </Animated.View>
      </View>
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
    paddingTop: SPACING.section,
  },
  question: {
    ...TYPOGRAPHY.question,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  energySection: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  energyLabel: {
    ...TYPOGRAPHY.label,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  energyChips: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.energyChipGap || SPACING.md,
  },
  energyChip: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    overflow: 'hidden',
  },
  energyChipText: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.border + '60',
    borderRadius: BORDER_RADIUS.button,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.card,
    minHeight: SPACING.button,
    ...SHADOWS.sm,
    // Focus state handled by React Native automatically
  },
  spacer: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    height: SPACING.button,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.screen,
    ...SHADOWS.primary,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.6,
  },
          confirmButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})
