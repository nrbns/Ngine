import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { useRouter } from 'expo-router'
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { supabase, Resolution } from '../../lib/supabase'
import { BannerAdComponent } from '../../lib/ads.web'
import { GoalCard } from '../../components/GoalCard'
import { AnimatedIdentityText } from '../../components/AnimatedIdentityText'
import { RealtimeIndicator } from '../../components/RealtimeIndicator'
import { TactileButton } from '../../components/TactileButton'
import {
  getTodayStatus,
  IntegrityStatus,
  TodayStatus,
} from '../../lib/realtime'
import { useRealtime } from '../../lib/useRealtime'
import { useNgineStore } from '../../lib/store'
import { performDailyChecks } from '../../lib/daily-check'
import { generateMotivationMessage, statusToMotivationContext } from '../../lib/ai-motivation'
import { COLORS } from '../../lib/colors'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../lib/design-tokens'
import { LoadingSkeleton } from '../../components/LoadingSkeleton'

export default function HomeScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [previousIdentity, setPreviousIdentity] = useState<string | undefined>()

  // Zustand store
  const goal = useNgineStore((state) => state.activeResolution)
  const todayStatus = useNgineStore((state) => state.todayStatus)
  const setGoal = useNgineStore((state) => state.setActiveResolution)
  const setTodayStatus = useNgineStore((state) => state.setTodayStatus)
  const setUserId = useNgineStore((state) => state.setUserId)

  // Animation values
  const buttonScale = useSharedValue(1)

  // Realtime hook - automatically subscribes to changes
  const { isOnline, refreshTodayStatus } = useRealtime({
    resolutionId: goal?.id,
    enabled: !!goal,
  })

  // Load goal and status
  const loadData = async () => {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
      if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' || supabaseUrl.includes('placeholder')) {
        console.warn('Supabase not configured - running in offline mode')
        setLoading(false)
        setGoal(null)
        setTodayStatus(null)
        return
      }

      let { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        const { data: authData } = await supabase.auth.signInAnonymously()
        user = authData?.user || null
      }

      if (!user) {
        setLoading(false)
        return
      }

      setUserId(user.id)

      // Get active goal
      const { data: goalData } = await supabase
        .from('resolutions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (goalData) {
        setGoal(goalData)
        
        // Perform daily checks (completion, missed days, etc.)
        await performDailyChecks(goalData, user.id)
        
        // Refresh goal data after daily checks (in case status changed)
        const { data: updatedGoal } = await supabase
          .from('resolutions')
          .select('*')
          .eq('id', goalData.id)
          .single()
        
        if (updatedGoal) {
          setGoal(updatedGoal)
          
        // Get today's status AFTER daily checks
        const status = await getTodayStatus(updatedGoal.id, user.id)
        
        // Get recent check-ins for AI context
        const { data: recentCheckins } = await supabase
          .from('checkins')
          .select('*')
          .eq('resolution_id', updatedGoal.id)
          .order('date', { ascending: false })
          .limit(7)
        
        // Generate AI-powered identity message
        const context = statusToMotivationContext(status, updatedGoal, recentCheckins || [])
        const newIdentity = generateMotivationMessage(context, 'identity')
        
        if (todayStatus) {
          const oldContext = statusToMotivationContext(todayStatus, updatedGoal, recentCheckins || [])
          const oldIdentity = generateMotivationMessage(oldContext, 'identity')
          if (oldIdentity !== newIdentity) {
            setPreviousIdentity(oldIdentity)
          }
        }
        
        setTodayStatus(status)
        }
      } else {
        setGoal(null)
        setTodayStatus(null)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadData()
  }, [])

  // Refresh today status when goal changes
  useEffect(() => {
    if (goal) {
      refreshTodayStatus()
    }
  }, [goal?.id, refreshTodayStatus])

  const handleCheckin = (type: 'yes' | 'partial' | 'no') => {
    if (!goal) {
      router.push('/create-goal')
      return
    }

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    
    // Spring animation
    buttonScale.value = withSpring(0.96, {}, () => {
      buttonScale.value = withSpring(1)
    })

    // Optimistic update - update UI immediately
    const optimisticStatus: TodayStatus = {
      hasCheckedIn: true,
      status: type === 'yes' ? 'ALIGNED' : type === 'partial' ? 'DRIFTING' : 'DRIFTING',
      lastCheckin: {
        id: 'temp',
        resolution_id: goal.id,
        execution: type,
        energy: 3,
        created_at: new Date().toISOString(),
      },
      streak: type === 'yes' ? (todayStatus?.streak || 0) + 1 : 0,
    }
    
    setTodayStatus(optimisticStatus)
    
    // Generate previous identity message for animation
    if (goal && todayStatus) {
      const prevContext = statusToMotivationContext(todayStatus, goal, [])
      const prevIdentity = generateMotivationMessage(prevContext, 'identity')
      setPreviousIdentity(prevIdentity)
    }

    // Navigate to check-in screen
    router.push({
      pathname: '/checkin',
      params: { goalId: goal.id, status: type }
    })
  }

  // Animated style for action buttons
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))

  // Get AI-generated identity message
  const identityMessage = goal && todayStatus
    ? generateMotivationMessage(
        statusToMotivationContext(todayStatus, goal, []),
        'identity'
      )
    : 'Today is your canvas. Paint it with action.'

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View entering={FadeInUp.duration(180)} style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your day...</Text>
          <View style={styles.loadingSkeletonContainer}>
            <LoadingSkeleton type="card" count={1} />
          </View>
        </Animated.View>
      </SafeAreaView>
    )
  }

  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>{getCurrentTimeGreeting()}</Text>
          <RealtimeIndicator />
        </View>
        <AnimatedIdentityText identity={identityMessage} />
      </View>

      <View style={styles.content}>
        {goal && todayStatus ? (
          <>
            <GoalCard 
              goal={goal} 
              status={todayStatus.status}
              streak={todayStatus.streak}
              totalDays={todayStatus.streak + 7}
            />

            {/* ACTION ROW */}
            <Animated.View entering={FadeInUp.delay(200).duration(300)} style={styles.actionRow}>
              {(['done', 'partial', 'missed'] as const).map((type, index) => {
                const statusMap = {
                  done: { label: '✅ Done', color: COLORS.success, status: 'yes' as const, shadow: SHADOWS.success },
                  partial: { label: '🟡 Partial', color: COLORS.warning, status: 'partial' as const, shadow: SHADOWS.md },
                  missed: { label: '❌ Missed', color: COLORS.danger, status: 'no' as const, shadow: SHADOWS.md },
                }
                const config = statusMap[type]
                
                return (
                  <Animated.View 
                    key={type} 
                    entering={FadeInUp.delay(250 + index * 50).duration(300)}
                    style={buttonAnimatedStyle}
                  >
                    <Pressable
                      onPress={() => handleCheckin(config.status)}
                      onPressIn={() => {
                        buttonScale.value = withSpring(0.95)
                      }}
                      onPressOut={() => {
                        buttonScale.value = withSpring(1)
                      }}
                      style={[
                        styles.actionButton,
                        { backgroundColor: config.color },
                        config.shadow
                      ]}
                    >
                      <Text style={styles.actionButtonText}>
                        {config.label}
                      </Text>
                    </Pressable>
                  </Animated.View>
                )
              })}
            </Animated.View>
          </>
        ) : (
          <Animated.View entering={FadeInUp.duration(280)} style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🎯</Text>
            </View>
            <Text style={styles.emptyTitle}>No active goal</Text>
            <Text style={styles.emptySubtitle}>
              Create your first goal to start building consistency and track your daily progress
            </Text>
            <View style={styles.emptyButtonContainer}>
              <TactileButton
                label="Create Goal"
                onPress={() => router.push('/create-goal')}
                variant="done"
              />
            </View>
          </Animated.View>
        )}
      </View>

      <View style={styles.adContainer}>
        <BannerAdComponent />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 16,
    marginBottom: SPACING.xl,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loadingSkeletonContainer: {
    width: '100%',
    paddingHorizontal: SPACING.screen,
    marginTop: SPACING.lg,
  },
  header: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.section,
    marginBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.section,
  },
  greeting: {
    ...TYPOGRAPHY.greeting,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.actionButtonGap || SPACING.sm,
    marginTop: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    height: SPACING.button,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  doneButton: {
    backgroundColor: COLORS.success,
  },
  partialButton: {
    backgroundColor: COLORS.warning,
  },
  missedButton: {
    backgroundColor: COLORS.danger,
  },
  actionButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  spacer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.screen,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
    ...SHADOWS.md,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    ...TYPOGRAPHY.goalTitle,
    fontSize: 26,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TYPOGRAPHY.goalMdd,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl * 2,
    lineHeight: 24,
    maxWidth: 320,
    opacity: 0.8,
  },
  emptyButtonContainer: {
    width: '100%',
    maxWidth: 240,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.button,
    minHeight: SPACING.button,
  },
  createButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textPrimary,
  },
  adContainer: {
    paddingBottom: SPACING.screen,
  },
})
