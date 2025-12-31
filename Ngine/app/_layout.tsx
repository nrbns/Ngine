// Root layout with real authentication and navigation
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase, signInAnonymously } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { requestPermissions, scheduleDailyReminder } from '../utils/notifications';
import { colors } from '../design-system';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set up notifications
    requestPermissions().then((granted) => {
      if (granted) {
        scheduleDailyReminder('21:00'); // 9 PM daily reminder
      }
    });

    // Set up authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsReady(true);
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      // Auto-sign in anonymously if no session
      if (event === 'SIGNED_OUT' || !session) {
        try {
          await signInAnonymously();
        } catch (error) {
          console.error('Anonymous sign in failed:', error);
        }
      }
    });
  }, []);

  if (!isReady) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
        <ActivityIndicator size="large" color={colors.accent} />
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