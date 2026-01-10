import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { IntegrityStatus } from '../../lib/utils/realtime'
import { COLORS } from '../../lib/config/colors'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../lib/config/design-tokens'
import { SCALE, ANIMATION_TIMINGS } from '../../lib/config/animations'

interface AnimatedStatusBadgeProps {
  status: IntegrityStatus
  onStatusChange?: boolean
}

export const AnimatedStatusBadge: React.FC<AnimatedStatusBadgeProps> = ({ 
  status, 
  onStatusChange = false 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const colorAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (onStatusChange) {
      // Pop animation when status changes
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: SCALE.pressed,
          duration: ANIMATION_TIMINGS.micro,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [status, onStatusChange])

  if (status === 'NONE') {
    return null
  }

  const config = {
    ALIGNED: {
      text: '● ALIGNED',
      color: COLORS.success,
      bgColor: 'rgba(74, 222, 128, 0.15)',
    },
    DRIFTING: {
      text: '⚠ DRIFTING',
      color: COLORS.warning,
      bgColor: 'rgba(250, 204, 21, 0.15)',
    },
  }[status]

  return (
    <Animated.View
      style={[
        styles.badgeContainer,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
        <Text style={[styles.badgeText, { color: config.color }]}>
          {config.text}
        </Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  badgeContainer: {
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs / 2 + 2,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    borderColor: 'transparent',
    ...SHADOWS.sm,
  },
  badgeText: {
    ...TYPOGRAPHY.label,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
})


