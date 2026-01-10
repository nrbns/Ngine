import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { useEffect } from 'react'
import { AnimatedBackground } from '../components'
import { useOfflineDetection } from '../lib'
import { requestNotificationPermissions, scheduleDailyReminder } from '../lib/notifications'

export default function RootLayout() {
  // Enable offline detection globally
  useOfflineDetection()

  // Setup notifications on app start
  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await requestNotificationPermissions()
      if (hasPermission) {
        // Schedule daily reminder at 9 AM
        await scheduleDailyReminder({
          hour: 9,
          minute: 0,
          enabled: true,
        })
      }
    }
    setupNotifications()
  }, [])

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0E0F13" translucent={false} />
      <View style={{ flex: 1 }}>
        <AnimatedBackground />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="create-goal" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="checkin" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="gallery" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="recovery" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="set-focus-areas" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack>
      </View>
    </SafeAreaProvider>
  )
}