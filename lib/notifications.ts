// Daily check-in notifications for NGINE
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export interface NotificationConfig {
  hour: number // 0-23
  minute: number // 0-59
  enabled: boolean
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted')
      return false
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Daily Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C6FF5',
      })
    }

    return true
  } catch (error) {
    console.error('Error requesting notification permissions:', error)
    return false
  }
}

/**
 * Schedule daily check-in notification
 */
export async function scheduleDailyReminder(
  config: NotificationConfig
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions()
    if (!hasPermission) {
      return null
    }

    // Cancel existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync()

    if (!config.enabled) {
      return null
    }

    // Schedule daily notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to check in! 🎯',
        body: 'Did you show up today? Track your progress now.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'daily_checkin' },
      },
      trigger: {
        hour: config.hour,
        minute: config.minute,
        repeats: true,
      },
    })

    console.log('Daily reminder scheduled:', notificationId)
    return notificationId
  } catch (error) {
    console.error('Error scheduling notification:', error)
    return null
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync()
    console.log('All notifications cancelled')
  } catch (error) {
    console.error('Error cancelling notifications:', error)
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync()
  } catch (error) {
    console.error('Error getting scheduled notifications:', error)
    return []
  }
}

