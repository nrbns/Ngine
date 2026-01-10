import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { COLORS } from '../lib/colors'
import { TYPOGRAPHY, SHADOWS } from '../lib/design-tokens'

interface ProgressCircleProps {
  current: number
  total: number
  size?: number
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  current,
  total,
  size = 60,
}) => {
  const progress = total > 0 ? Math.min(current / total, 1) : 0
  const percentage = Math.round(progress * 100)

  return (
    <Animated.View entering={FadeIn.duration(400)} style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, SHADOWS.md]}>
        <View style={styles.innerContent}>
          <Text style={[styles.number, { fontSize: size * 0.3 }]}>
            {current}
          </Text>
          <Text style={[styles.total, { fontSize: size * 0.18 }]}>
            /{total}
          </Text>
        </View>
        {/* Progress ring using border trick */}
        <View
          style={[
            styles.progressRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 4,
              borderColor: COLORS.border + '40',
              borderTopColor: progress > 0 ? COLORS.success : COLORS.border + '40',
              borderRightColor: progress > 0.25 ? COLORS.success : COLORS.border + '40',
              borderBottomColor: progress > 0.5 ? COLORS.success : COLORS.border + '40',
              borderLeftColor: progress > 0.75 ? COLORS.success : COLORS.border + '40',
            },
          ]}
        />
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border + '30',
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  number: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    lineHeight: 20,
  },
  total: {
    color: COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 16,
  },
})

