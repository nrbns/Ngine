// Root layout with navigation
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestPermissions, scheduleDailyReminder } from '../utils/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check onboarding status
    AsyncStorage.getItem('onboarding_complete').then((onboardingComplete) => {
      if (!onboardingComplete) {
        setInitialRoute('/onboarding');
      } else {
        setInitialRoute('/index');
      }
      setIsReady(true);
    });

    // Request notification permissions and schedule daily reminder
    requestPermissions().then((granted) => {
      if (granted) {
        scheduleDailyReminder('21:00'); // 9 PM daily reminder
      }
    });
  }, []);

  useEffect(() => {
    if (!isReady || !initialRoute) return;

    const inAuthGroup = segments[0] === 'onboarding';
    const inAppGroup = segments[0] === 'index' || segments[0] === 'profile' || segments[0] === 'aims' || segments[0] === 'create' || segments[0] === 'checkin' || segments[0] === 'recovery' || segments[0] === 'summary';

    if (initialRoute === '/onboarding' && !inAuthGroup) {
      router.replace('/onboarding');
    } else if (initialRoute === '/index' && inAuthGroup) {
      router.replace('/index');
    }
  }, [isReady, initialRoute, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="aims" />
      <Stack.Screen name="create" />
      <Stack.Screen name="checkin" />
      <Stack.Screen name="recovery" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
