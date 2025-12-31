// Push notification utilities
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(time: string = '09:00') {
  const [hours, minutes] = time.split(':').map(Number);
  
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'NGINE Daily Check-in',
      body: 'Time for your daily resolution check-in!',
      sound: true,
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });
}

export async function sendDriftAlert(resolutionTitle: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Resolution Drifting',
      body: `${resolutionTitle} is starting to drift. Check in to get back on track.`,
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

export async function sendRecoveryReminder(resolutionTitle: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recovery Mode',
      body: `${resolutionTitle}: Focus on small wins today.`,
      sound: true,
    },
    trigger: null,
  });
}

