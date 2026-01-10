import React, { useEffect, useRef } from 'react'
import { Text, StyleSheet, Animated } from 'react-native'
import { COLORS } from '../lib/colors'
import { TYPOGRAPHY } from '../lib/design-tokens'
import { ANIMATION_TIMINGS } from '../lib/animations'

interface AnimatedIdentityTextProps {
  identity: string
  isChanging?: boolean
}

export const AnimatedIdentityText: React.FC<AnimatedIdentityTextProps> = ({ 
  identity, 
  isChanging = false 
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const colorAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isChanging) {
      // Crossfade animation when text changes
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: ANIMATION_TIMINGS.fast,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -8,
            duration: ANIMATION_TIMINGS.fast,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: ANIMATION_TIMINGS.fast,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: ANIMATION_TIMINGS.fast,
            useNativeDriver: true,
          }),
        ]),
      ]).start()
    } else {
      // Initial entrance
      fadeAnim.setValue(0)
      slideAnim.setValue(8)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_TIMINGS.normal,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_TIMINGS.normal,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [identity, isChanging])

  return (
    <Animated.Text
      style={[
        styles.text,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {identity}
    </Animated.Text>
  )
}

const styles = StyleSheet.create({
  text: {
    ...TYPOGRAPHY.identity,
    color: COLORS.identity,
  },
})


