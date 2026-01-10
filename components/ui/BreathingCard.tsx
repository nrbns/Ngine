import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { COLORS } from '../../lib/config/colors'
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../lib/config/design-tokens'
import { SCALE } from '../../lib/config/animations'

interface BreathingCardProps {
  children: React.ReactNode
}

export const BreathingCard: React.FC<BreathingCardProps> = ({ children }) => {
  const scaleAnim = useRef(new Animated.Value(SCALE.breathing.min)).current

  useEffect(() => {
    // Breathing effect: 1 → 1.01 → 1 every 6 seconds
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: SCALE.breathing.max,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: SCALE.breathing.min,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.delay(3000), // Pause before next cycle
      ])
    )

    breathing.start()

    return () => breathing.stop()
  }, [])

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.card,
    marginVertical: SPACING.md,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: COLORS.border + '40',
    overflow: 'hidden',
    // Subtle gradient overlay effect
    position: 'relative',
  },
})


