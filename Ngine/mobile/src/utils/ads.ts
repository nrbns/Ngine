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

// Placeholder functions - implement with actual AdMob SDK
export async function showNativeBanner() {
  // TODO: Implement native banner ad
  console.log('Show native banner ad');
}

export async function showRewardedAd(): Promise<boolean> {
  // TODO: Implement rewarded ad
  // Returns true if user watched ad and earned reward
  console.log('Show rewarded ad');
  return Promise.resolve(true);
}

