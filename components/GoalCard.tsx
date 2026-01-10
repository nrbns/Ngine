import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { AnimatedStatusBadge } from './AnimatedStatusBadge'
import { BreathingCard } from './BreathingCard'
import { ProgressCircle } from './ProgressCircle'
import { IntegrityStatus } from '../lib/realtime'
import { COLORS } from '../lib/colors'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../lib/design-tokens'

interface Goal {
  id: string
  title: string
  mdd: string
}

interface GoalCardProps {
  goal: Goal
  status: IntegrityStatus
  streak?: number
  totalDays?: number
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, status, streak = 0, totalDays = 0 }) => {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
      <BreathingCard>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Animated.View entering={FadeInDown.duration(300).delay(200)}>
              <Text style={styles.label}>Today's Goal</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(300).delay(250)}>
              <Text style={styles.title}>{goal.title}</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(300).delay(300)}>
              <Text style={styles.mdd}>{goal.mdd}</Text>
            </Animated.View>
          </View>
          {totalDays > 0 && (
            <Animated.View entering={FadeInDown.duration(400).delay(350)}>
              <ProgressCircle current={streak} total={totalDays} size={70} />
            </Animated.View>
          )}
        </View>
        <View style={styles.divider} />
        <Animated.View entering={FadeInDown.duration(300).delay(400)} style={styles.footer}>
          <AnimatedStatusBadge status={status} />
          {streak > 0 && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakText}>🔥 {streak} day streak</Text>
            </View>
          )}
        </Animated.View>
      </BreathingCard>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  title: {
    ...TYPOGRAPHY.goalTitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  mdd: {
    ...TYPOGRAPHY.goalMdd,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
    opacity: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContainer: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
  },
  streakText: {
    fontSize: 13,
    color: COLORS.warning,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})
