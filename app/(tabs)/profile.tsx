import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { supabase, Checkin } from '../../lib/api/supabase'
import { AnimatedIdentityText, CountUpNumber, IntegrityDots, RealtimeIndicator } from '../../components'
import { getIntegrityDots, getLastActionText } from '../../lib/utils/realtime'
import { useNgineStore } from '../../lib/store'
import { useRealtime } from '../../lib/hooks/useRealtime'
import { generateDailyMotivation, statusToMotivationContext } from '../../lib/utils/ai-motivation'
import { COLORS } from '../../lib/config/colors'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../lib/config/design-tokens'

export default function ProfileScreen() {
  const [identity, setIdentity] = useState('You are becoming disciplined.')
  const [daysCheckedIn, setDaysCheckedIn] = useState(0)
  const [resets, setResets] = useState(0)
  const [integrityDots, setIntegrityDots] = useState<any[]>([])
  const [lastAction, setLastAction] = useState<string>('No check-ins yet')
  const [loading, setLoading] = useState(true)
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [calendarDays, setCalendarDays] = useState<any[]>([])

  // Zustand store
  const activeResolution = useNgineStore((state) => state.activeResolution)
  const checkins = useNgineStore((state) => state.checkins)
  const setUserId = useNgineStore((state) => state.setUserId)

  // Realtime hook
  const { isOnline } = useRealtime({
    resolutionId: activeGoalId || undefined,
    enabled: !!activeGoalId,
  })

  const loadProgress = async () => {
    try {
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

      // Get active goal (with full data for AI context)
      const { data: resolutions } = await supabase
        .from('resolutions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

      if (resolutions && resolutions.length > 0) {
        const goalId = resolutions[0].id
        setActiveGoalId(goalId)

        // Load integrity dots
        const dots = await getIntegrityDots(goalId)
        setIntegrityDots(dots)

        // Use checkins from store if available, otherwise fetch
        let checkinsData = checkins.filter(c => c.resolution_id === goalId)
        
        if (checkinsData.length === 0) {
          const { data: fetchedCheckins } = await supabase
            .from('checkins')
            .select('execution, created_at, date, resolution_id')
            .eq('resolution_id', goalId)
            .order('created_at', { ascending: false })
          checkinsData = (fetchedCheckins || []) as Checkin[]
        }

        if (checkinsData && checkinsData.length > 0) {
          setDaysCheckedIn(checkinsData.length)

          // Get last action
          const lastCheckin = checkinsData[0] as Checkin
          setLastAction(getLastActionText(lastCheckin))

          // Calendar days removed - using integrity dots instead

          // Calculate current streak
          const sortedCheckins = [...checkinsData].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          
          let streak = 0
          const today = new Date().toISOString().split('T')[0]
          let currentDate = new Date(today)
          
          for (const checkin of sortedCheckins) {
            const checkinDate = new Date(checkin.created_at).toISOString().split('T')[0]
            if (checkin.execution === 'yes' && checkinDate === currentDate.toISOString().split('T')[0]) {
              streak++
              currentDate.setDate(currentDate.getDate() - 1)
            } else if (checkin.execution === 'yes') {
              // Check if consecutive
              const prevDate = new Date(currentDate)
              prevDate.setDate(prevDate.getDate() + 1)
              if (checkinDate === prevDate.toISOString().split('T')[0]) {
                streak++
                currentDate.setDate(currentDate.getDate() - 1)
              } else {
                break
              }
            } else {
              break
            }
          }
          
          setCurrentStreak(streak)

          // Count resets
          let resetCount = 0
          let hadMiss = false

          const sortedByDate = [...checkinsData].sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )

          for (const checkin of sortedByDate) {
            if (checkin.execution !== 'yes') {
              hadMiss = true
            } else if (hadMiss) {
              resetCount++
              hadMiss = false
            }
          }

          setResets(resetCount)

          // Generate AI-powered identity message based on progress
          if (resolutions && resolutions.length > 0) {
            const goal = resolutions[0]
            const context = statusToMotivationContext(
              {
                status: streak >= 3 ? 'ALIGNED' : streak === 0 ? 'DRIFTING' : 'DRIFTING',
                hasCheckedIn: checkinsData.length > 0,
                lastCheckin: lastCheckin,
                streak: streak,
              },
              goal,
              checkinsData as Checkin[]
            )
            
            const aiIdentity = generateDailyMotivation(context)
            setIdentity(aiIdentity)
          }
        } else {
          setCalendarDays([])
          setCurrentStreak(0)
          
          // No check-ins yet - generate initial motivation
          if (resolutions && resolutions.length > 0) {
            const goal = resolutions[0]
            const context = statusToMotivationContext(null, goal, [])
            const aiIdentity = generateDailyMotivation(context)
            setIdentity(aiIdentity)
          }
        }
      } else {
        setActiveGoalId(null)
        setIntegrityDots([])
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProgress()
  }, [])

  // Reload when checkins change (from realtime)
  useEffect(() => {
    if (activeGoalId && checkins.length > 0) {
      loadProgress()
    }
  }, [checkins.length, activeGoalId])

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading progress...</Text>
          <View style={styles.loadingSkeletonContainer}>
            <LoadingSkeleton type="list" count={3} />
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeIn.delay(50).duration(300)} style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
        <RealtimeIndicator />
      </Animated.View>

      <View style={styles.content}>
        {/* Profile Section */}
        <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.profileSection}>
          <View style={styles.profilePicture}>
            <Text style={styles.profilePictureText}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>John</Text>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <AnimatedIdentityText identity={identity} />
          </View>
        </Animated.View>

        {/* Focus Areas */}
        <Animated.View entering={FadeIn.delay(150).duration(300)} style={styles.focusAreasContainer}>
          <Pressable style={styles.focusAreaButton}>
            <Text style={styles.focusAreaIcon}>💼</Text>
            <Text style={styles.focusAreaText}>Build My Business</Text>
          </Pressable>
          <Pressable style={styles.focusAreaButton}>
            <Text style={styles.focusAreaIcon}>💪</Text>
            <Text style={styles.focusAreaText}>Improve My Fitness</Text>
          </Pressable>
          <Pressable style={styles.focusAreaButton}>
            <Text style={styles.focusAreaIcon}>📚</Text>
            <Text style={styles.focusAreaText}>Deepen My Knowledge</Text>
          </Pressable>
        </Animated.View>
        {/* Progress Section */}
        {activeGoalId && integrityDots.length > 0 && (
          <Animated.View entering={FadeIn.delay(200).duration(300)} style={styles.progressSection}>
            <IntegrityDots dots={integrityDots} />
          </Animated.View>
        )}

        <Animated.View entering={FadeIn.delay(250).duration(300)} style={styles.metricsContainer}>
          <Animated.View entering={FadeIn.delay(300).duration(300)} style={styles.metricCard}>
            <CountUpNumber value={daysCheckedIn} style={styles.metricNumber} />
            <Text style={styles.metricLabel}>Days showed up</Text>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(350).duration(300)} style={styles.metricCard}>
            <CountUpNumber value={resets} style={styles.metricNumber} />
            <Text style={styles.metricLabel}>Resets overcome</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(400).duration(300)} style={styles.lastActionCard}>
          <Text style={styles.lastActionLabel}>Last action</Text>
          <Text style={styles.lastActionText}>{lastAction}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.greeting,
    fontSize: 28,
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.section,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  profilePicture: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
    ...SHADOWS.md,
  },
  profilePictureText: {
    fontSize: 30,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  name: {
    ...TYPOGRAPHY.greeting,
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  checkmark: {
    fontSize: 18,
    color: COLORS.success,
    fontWeight: '700',
  },
  focusAreasContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  focusAreaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.border + '40',
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  focusAreaIcon: {
    fontSize: 24,
  },
  focusAreaText: {
    ...TYPOGRAPHY.label,
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
  progressSection: {
    marginBottom: SPACING.lg,
  },
  integrityDotsRow: {
    flexDirection: 'row',
    marginVertical: SPACING.lg,
    justifyContent: 'center',
    gap: 10,
  },
  integrityDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  noDotsContainer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  noDotsText: {
    fontSize: 14,
    color: COLORS.muted,
    fontStyle: 'italic',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.card,
    borderRadius: BORDER_RADIUS.card,
    alignItems: 'center',
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: COLORS.border + '40',
    overflow: 'hidden',
  },
  metricNumber: {
    ...TYPOGRAPHY.metric,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  metricLabel: {
    ...TYPOGRAPHY.metricLabel,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  lastActionCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.card,
    borderRadius: BORDER_RADIUS.card,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.border + '40',
    marginTop: SPACING.lg,
    overflow: 'hidden',
  },
  lastActionLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  lastActionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
})
