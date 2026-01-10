// Platform-safe haptics wrapper
// Haptics only work on native platforms (iOS/Android), not on web
import { Platform } from 'react-native'

// Check platform first before any haptics import
const isWeb = Platform.OS === 'web'

// Only import haptics module if not on web (to prevent web errors)
let Haptics: any = null

if (!isWeb) {
  try {
    // Dynamic require to prevent web bundling issues
    Haptics = require('expo-haptics')
  } catch (error) {
    // If import fails, haptics unavailable (shouldn't happen on native, but handle gracefully)
    Haptics = null
  }
}

/**
 * Platform-safe haptics impact feedback
 */
export const impactAsync = async (style: any = undefined): Promise<void> => {
  // Double-check platform at runtime
  if (Platform.OS === 'web' || !Haptics || isWeb) {
    return Promise.resolve()
  }
  
  try {
    const ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle || {}
    const feedbackStyle = style || ImpactFeedbackStyle.Light || 'light'
    await Haptics.impactAsync(feedbackStyle)
  } catch (error) {
    // Silently fail on web or if haptics unavailable
    // Don't log errors in production to avoid noise
  }
}

/**
 * Platform-safe haptics notification feedback
 */
export const notificationAsync = async (type: any = undefined): Promise<void> => {
  // Double-check platform at runtime
  if (Platform.OS === 'web' || !Haptics || isWeb) {
    return Promise.resolve()
  }
  
  try {
    const NotificationFeedbackType = Haptics.NotificationFeedbackType || {}
    const feedbackType = type || NotificationFeedbackType.Success || 'success'
    await Haptics.notificationAsync(feedbackType)
  } catch (error) {
    // Silently fail on web or if haptics unavailable
    // Don't log errors in production to avoid noise
  }
}

/**
 * Platform-safe haptics selection feedback
 */
export const selectionAsync = async (): Promise<void> => {
  // Double-check platform at runtime
  if (Platform.OS === 'web' || !Haptics || isWeb) {
    return Promise.resolve()
  }
  
  try {
    await Haptics.selectionAsync()
  } catch (error) {
    // Silently fail on web or if haptics unavailable
    // Don't log errors in production to avoid noise
  }
}

// Re-export types for convenience (with fallbacks for web)
let ImpactFeedbackStyle: any
let NotificationFeedbackType: any

try {
  if (Platform.OS !== 'web' && Haptics) {
    ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle || {
      Light: 'light',
      Medium: 'medium',
      Heavy: 'heavy',
    }
    NotificationFeedbackType = Haptics.NotificationFeedbackType || {
      Success: 'success',
      Warning: 'warning',
      Error: 'error',
    }
  } else {
    // Fallback enum values for TypeScript on web
    ImpactFeedbackStyle = {
      Light: 'light',
      Medium: 'medium',
      Heavy: 'heavy',
    }
    NotificationFeedbackType = {
      Success: 'success',
      Warning: 'warning',
      Error: 'error',
    }
  }
} catch (error) {
  // Fallback enum values if import fails
  ImpactFeedbackStyle = {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  }
  NotificationFeedbackType = {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  }
}

export { ImpactFeedbackStyle, NotificationFeedbackType }
