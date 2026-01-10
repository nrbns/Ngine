import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { IntegrityDot } from '../lib/realtime'
import { COLORS } from '../lib/colors'
import { ANIMATION_TIMINGS } from '../lib/animations'
import { SHADOWS } from '../lib/design-tokens'

interface IntegrityDotsProps {
  dots: IntegrityDot[]
}

export const IntegrityDots: React.FC<IntegrityDotsProps> = ({ dots }) => {
  const fadeAnims = useRef(
    dots.map(() => new Animated.Value(0))
  ).current

  useEffect(() => {
    // Staggered fade-in: 80ms per dot
    fadeAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: ANIMATION_TIMINGS.normal,
        delay: index * ANIMATION_TIMINGS.micro,
        useNativeDriver: true,
      }).start()
    })
  }, [dots])

  return (
    <View style={styles.container}>
      {dots.map((dot, index) => {
        const isToday = index === dots.length - 1
        const dotStyle = dot.status === 'yes' 
          ? styles.dotYes 
          : dot.status === 'partial' 
          ? styles.dotPartial 
          : dot.status === 'no'
          ? styles.dotNo
          : styles.dotEmpty

        return (
          <Animated.View
            key={dot.date}
            style={[
              styles.dotContainer,
              {
                opacity: fadeAnims[index] || 0,
              },
            ]}
          >
            <View style={[styles.dot, dotStyle, isToday && styles.dotToday]} />
            {isToday && <Text style={styles.todayLabel}>Today</Text>}
          </Animated.View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  dotContainer: {
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  dotYes: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
    ...SHADOWS.sm,
  },
  dotPartial: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
    ...SHADOWS.sm,
  },
  dotNo: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
    ...SHADOWS.sm,
  },
  dotEmpty: {
    backgroundColor: COLORS.border + '40',
    borderColor: COLORS.border + '60',
    opacity: 0.5,
  },
  dotToday: {
    width: 20,
    height: 20,
    borderRadius: 10,
    ...SHADOWS.md,
    borderWidth: 2.5,
  },
  todayLabel: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
})

