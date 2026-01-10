import React, { useEffect, useRef } from 'react'
import { Text, StyleSheet, Animated } from 'react-native'
import { COLORS } from '../../lib/config/colors'
import { ANIMATION_TIMINGS } from '../../lib/config/animations'

interface CountUpNumberProps {
  value: number
  duration?: number
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  value,
  duration = ANIMATION_TIMINGS.slow,
}) => {
  const animValue = useRef(new Animated.Value(0)).current
  const [displayValue, setDisplayValue] = React.useState(0)

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start()

    const listener = animValue.addListener(({ value: v }) => {
      setDisplayValue(Math.round(v))
    })

    return () => {
      animValue.removeListener(listener)
    }
  }, [value])

  return (
    <Text style={styles.number}>{displayValue}</Text>
  )
}

const styles = StyleSheet.create({
  number: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
    textShadowColor: COLORS.primary + '30',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
})

