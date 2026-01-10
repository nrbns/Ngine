// Web-specific haptics wrapper (no-op implementations)
// Haptics don't work on web, so all functions are no-ops

import { Platform } from 'react-native'

// Fallback enum values for TypeScript
export const ImpactFeedbackStyle = {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy',
} as const

export const NotificationFeedbackType = {
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
} as const

/**
 * Platform-safe haptics impact feedback (no-op on web)
 */
export const impactAsync = async (_style?: any): Promise<void> => {
  // No-op on web
  return Promise.resolve()
}

/**
 * Platform-safe haptics notification feedback (no-op on web)
 */
export const notificationAsync = async (_type?: any): Promise<void> => {
  // No-op on web
  return Promise.resolve()
}

/**
 * Platform-safe haptics selection feedback (no-op on web)
 */
export const selectionAsync = async (): Promise<void> => {
  // No-op on web
  return Promise.resolve()
}
