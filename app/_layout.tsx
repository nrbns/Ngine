import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="create-goal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="checkin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="gallery" options={{ presentation: 'modal' }} />
        <Stack.Screen name="recovery" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  )
}