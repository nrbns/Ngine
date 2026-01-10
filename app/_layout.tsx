import { Stack, useRouter, useSegments } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { useEffect, useState } from 'react'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { useOfflineDetection } from '../lib/offline'
import { requestNotificationPermissions, scheduleDailyReminder } from '../lib/notifications'
import { hasCompletedOnboarding } from './onboarding'

export default function RootLayout() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null)
  const segments = useSegments()

  // Enable offline detection globally
  useOfflineDetection()

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await hasCompletedOnboarding()
      setIsOnboardingComplete(completed)
    }
    checkOnboarding()
  }, [])

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

  // Show loading state while checking onboarding
  if (isOnboardingComplete === null) {
    return null // or a loading screen
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0E0F13" translucent={false} />
      <View style={{ flex: 1 }}>
        <AnimatedBackground />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
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