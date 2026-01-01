// Notification utilities
import * as Notifications from 'expo-notifications';

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(time: string = '21:00') {
  const [hours, minutes] = time.split(':').map(Number);
  
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'NGINE Daily Check-in',
      body: 'Did you execute today?',
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
    trigger: null,
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

