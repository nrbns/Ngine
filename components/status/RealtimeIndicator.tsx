// Visual indicator for realtime connection status
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated'
import { useNgineStore } from '../../lib/store'
import { COLORS } from '../../lib/config/colors'
import { SPACING, TYPOGRAPHY, SHADOWS } from '../../lib/config/design-tokens'

export const RealtimeIndicator: React.FC = () => {
  const isOnline = useNgineStore((state) => state.isOnline)
  const lastSync = useNgineStore((state) => state.lastSync)

  const pulseScale = useSharedValue(1)
  const pulseOpacity = useSharedValue(0.6)

  React.useEffect(() => {
    if (isOnline) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    } else {
      pulseScale.value = withTiming(1, { duration: 200 })
      pulseOpacity.value = withTiming(0.4, { duration: 200 })
    }
  }, [isOnline])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }))

  const getSyncText = () => {
    if (!isOnline) return 'Offline'
    if (!lastSync) return 'Syncing...'
    
    const secondsAgo = Math.floor((Date.now() - lastSync.getTime()) / 1000)
    if (secondsAgo < 5) return 'Live'
    if (secondsAgo < 60) return `${secondsAgo}s ago`
    return 'Synced'
  }

  if (!isOnline) {
    return (
      <View style={styles.container}>
        <View style={[styles.dot, styles.dotOffline]} />
        <Text style={[styles.text, styles.textOffline]}>{getSyncText()}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, styles.dotOnline, animatedStyle]} />
      <Text style={[styles.text, styles.textOnline]}>{getSyncText()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    backgroundColor: COLORS.card + '80',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border + '40',
    ...SHADOWS.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    ...SHADOWS.sm,
  },
  dotOnline: {
    backgroundColor: COLORS.success,
  },
  dotOffline: {
    backgroundColor: COLORS.textTertiary,
  },
  text: {
    ...TYPOGRAPHY.label,
    fontSize: 11,
    fontWeight: '500',
  },
  textOnline: {
    color: COLORS.success,
  },
  textOffline: {
    color: COLORS.textTertiary,
  },
})

