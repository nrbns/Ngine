import React, { useRef } from 'react'
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native'
import * as Haptics from 'expo-haptics'
import { COLORS } from '../../lib/config/colors'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../lib/config/design-tokens'
import { SCALE, ANIMATION_TIMINGS } from '../../lib/config/animations'

interface TactileButtonProps {
  label: string
  onPress: () => void
  variant: 'done' | 'partial' | 'missed'
  disabled?: boolean
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  label,
  onPress,
  variant,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    if (disabled) return
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Animated.timing(scaleAnim, {
      toValue: SCALE.pressed,
      duration: ANIMATION_TIMINGS.micro,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start()
  }

  const handlePress = () => {
    if (disabled) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onPress()
  }

  const variantStyles = {
    done: { backgroundColor: COLORS.success },
    partial: { backgroundColor: COLORS.warning },
    missed: { backgroundColor: COLORS.danger },
  }[variant]

  return (
    <Animated.View
      style={[
        { flex: 1, marginHorizontal: 6 },
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.button, variantStyles]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SPACING.button,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})


