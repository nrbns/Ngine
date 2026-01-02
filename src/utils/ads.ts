// AdMob integration utilities
// Note: Actual AdMob implementation requires native modules
// This is a structure/interface for future implementation

export const AD_UNITS = {
  NATIVE_BANNER: process.env.EXPO_PUBLIC_ADMOB_NATIVE_BANNER || '',
  REWARDED: process.env.EXPO_PUBLIC_ADMOB_REWARDED || '',
};

export interface AdConfig {
  showDuringCheckin: boolean;
  showDuringRecovery: boolean;
  showDuringFailure: boolean;
}

export const defaultAdConfig: AdConfig = {
  showDuringCheckin: false,
  showDuringRecovery: false,
  showDuringFailure: false,
};

import { Platform } from 'react-native';

// Placeholder functions - implement with actual AdMob SDK
export async function showNativeBanner() {
  if (Platform.OS === 'web') {
    // no-op on web
    return;
  }
  // For now, rely on the native banner component in `services/ads`
  console.log('Show native banner ad (stub - native implementation required)');
}

export async function showRewardedAd(): Promise<boolean> {
  if (Platform.OS === 'web') {
    // Simulate watching ad on web
    await new Promise((r) => setTimeout(r, 1200));
    return true;
  }

  try {
    const { showRewardedAd: show } = await import('../../services/ads');
    return await show();
  } catch (err) {
    console.warn('Rewarded ad helper failed; simulating', err);
    return false;
  }
}

