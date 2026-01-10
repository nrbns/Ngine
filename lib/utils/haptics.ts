// Platform-safe haptics wrapper
// Haptics only work on native platforms (iOS/Android), not on web
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const isWeb = Platform.OS === 'web'

/**
 * Platform-safe haptics impact feedback
 */
export const impactAsync = async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light): Promise<void> => {
  if (isWeb) return
  try {
    await Haptics.impactAsync(style)
  } catch (error) {
    // Silently fail on web or if haptics unavailable
    console.debug('Haptics not available:', error)
  }
}

/**
 * Platform-safe haptics notification feedback
 */
export const notificationAsync = async (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success): Promise<void> => {
  if (isWeb) return
  try {
    await Haptics.notificationAsync(type)
  } catch (error) {
    // Silently fail on web or if haptics unavailable
    console.debug('Haptics not available:', error)
  }
}

/**
 * Platform-safe haptics selection feedback
 */
export const selectionAsync = async (): Promise<void> => {
  if (isWeb) return
  try {
    await Haptics.selectionAsync()
  } catch (error) {
    // Silently fail on web or if haptics unavailable
    console.debug('Haptics not available:', error)
  }
}

// Re-export types for convenience
export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics'
