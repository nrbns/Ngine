import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Pressable,
} from 'react-native'
import { useRouter } from 'expo-router'
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { impactAsync, notificationAsync, ImpactFeedbackStyle, NotificationFeedbackType } from '../lib/utils/haptics'
import { COLORS } from '../lib/config/colors'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../lib/config/design-tokens'

const { width } = Dimensions.get('window')

const ONBOARDING_DATA = [
  {
    emoji: '🎯',
    title: 'Set Your Resolution',
    description: 'Define your minimum daily discipline and commit to showing up every single day.',
  },
  {
    emoji: '✅',
    title: 'Check In Daily',
    description: 'Track your progress with simple check-ins. Done, Partial, or Missed - every day counts.',
  },
  {
    emoji: '📈',
    title: 'Build Integrity',
    description: 'See your consistency pattern through integrity dots. Real-time reflection on your journey.',
  },
  {
    emoji: '💪',
    title: 'Reinforce Identity',
    description: 'Transform your actions into identity. Consistency leads to discipline. Discipline becomes who you are.',
  },
]

const ONBOARDING_COMPLETE_KEY = '@ngine_onboarding_complete'

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)
    return value === 'true'
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return false
  }
}

export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
  } catch (error) {
    console.error('Error setting onboarding complete:', error)
  }
}

export default function OnboardingScreen() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(0)
  const slideAnim = useSharedValue(0)

  const handleNext = () => {
    impactAsync(ImpactFeedbackStyle.Light)
    
    if (currentPage < ONBOARDING_DATA.length - 1) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      slideAnim.value = withSpring(nextPage)
    } else {
      handleFinish()
    }
  }

  const handleSkip = async () => {
    impactAsync(ImpactFeedbackStyle.Medium)
    await setOnboardingComplete()
    router.replace('/(tabs)')
  }

  const handleFinish = async () => {
    notificationAsync(NotificationFeedbackType.Success)
    await setOnboardingComplete()
    router.replace('/(tabs)')
  }

  const handlePrevious = () => {
    if (currentPage > 0) {
      impactAsync(ImpactFeedbackStyle.Light)
      const prevPage = currentPage - 1
      setCurrentPage(prevPage)
      slideAnim.value = withSpring(prevPage)
    }
  }

  const slideStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      slideAnim.value,
      [0, ONBOARDING_DATA.length - 1],
      [0, -(width * (ONBOARDING_DATA.length - 1))]
    )
    return {
      transform: [{ translateX }],
    }
  })

  const currentData = ONBOARDING_DATA[currentPage]

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <View style={styles.skipContainer}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.emojiContainer}
        >
          <Text style={styles.emoji}>{currentData.emoji}</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.textContainer}
        >
          <Text style={styles.title}>{currentData.title}</Text>
          <Text style={styles.description}>{currentData.description}</Text>
        </Animated.View>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentPage > 0 && (
          <Pressable onPress={handlePrevious} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        )}
        
        <Pressable
          onPress={handleNext}
          style={[
            styles.nextButton,
            currentPage === 0 && styles.nextButtonFullWidth,
          ]}
        >
          <Text style={styles.nextButtonText}>
            {currentPage === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next →'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  skipContainer: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.md,
    alignItems: 'flex-end',
  },
  skipButton: {
    padding: SPACING.sm,
  },
  skipText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.xl * 2,
  },
  emojiContainer: {
    marginBottom: SPACING.xl * 2,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  emoji: {
    fontSize: 64,
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  title: {
    ...TYPOGRAPHY.goalTitle,
    fontSize: 28,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xl * 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border + '60',
    opacity: 0.5,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
    opacity: 1,
    ...SHADOWS.sm,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.screen,
    gap: SPACING.md,
  },
  backButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  backButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textSecondary,
  },
  nextButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    ...SHADOWS.primary,
    overflow: 'hidden',
  },
  nextButtonFullWidth: {
    flex: 1,
  },
  nextButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})
