// Ads Integration - Safe and controlled
import { View, StyleSheet, Platform } from 'react-native';
import { ReactElement } from 'react';

// Use test IDs for development — define lazily when needed to avoid loading native modules on web
const getAdModule = () => {
  try {
    // require at runtime so bundlers for web don't eagerly evaluate native modules
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-google-mobile-ads');
  } catch (e) {
    // If the native module is not available (e.g., on web), return a safe fallback
    return null;
  }
};

// Note: Keep ad module loading inside functions to avoid evaluating native modules during web bundling
const defaultBannerId = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || 'ca-app-pub-xxx';
const defaultRewardedId = process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID || 'ca-app-pub-xxx';

// Dashboard Banner Ad Component
export function DashboardAd(): ReactElement {
  if (Platform.OS === 'web') {
    // Web: render a lightweight placeholder so bundler doesn't import native component
    return <View style={styles.adContainer} />;
  }

  const ads = getAdModule();
  if (!ads) return <View style={styles.adContainer} />;

  const { BannerAd, BannerAdSize, TestIds } = ads as any;

  const BANNER_AD_UNIT_ID = __DEV__
    ? (TestIds?.BANNER ?? 'ca-app-pub-xxxx')
    : defaultBannerId;

  return (
    <View style={styles.adContainer}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

// Show rewarded ad and return promise
export async function showRewardedAd(): Promise<boolean> {
  // If running on web, simulate the ad experience
  if (Platform.OS === 'web') {
    await new Promise((r) => setTimeout(r, 1200));
    return true;
  }

  const ads = getAdModule();
  if (!ads) {
    await new Promise((r) => setTimeout(r, 1200));
    return true;
  }

  const { RewardedAd, AdEventType, RewardedAdEventType, TestIds } = ads as any;
  const adUnitId = __DEV__ ? (TestIds?.REWARDED ?? 'ca-app-pub-xxxx') : defaultRewardedId;

  try {
    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    return await new Promise<boolean>((resolve) => {
      let rewardedEarned = false;

      let removeLoaded: (() => void) | null = null;
      let removeError: (() => void) | null = null;
      let removeEarned: (() => void) | null = null;
      let removeClosed: (() => void) | null = null;

      const cleanup = () => {
        try { removeLoaded && removeLoaded(); } catch (e) {}
        try { removeError && removeError(); } catch (e) {}
        try { removeEarned && removeEarned(); } catch (e) {}
        try { removeClosed && removeClosed(); } catch (e) {}
      };

      removeLoaded = rewarded.addAdEventListener(AdEventType.LOADED, () => {
        rewarded.show();
      });

      removeError = rewarded.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.warn('Rewarded ad error', error);
        cleanup();
        resolve(false);
      });

      removeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        rewardedEarned = true;
      });

      removeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        cleanup();
        resolve(rewardedEarned);
      });

      rewarded.load();

      // Safety timeout (30s)
      setTimeout(() => {
        cleanup();
        resolve(rewardedEarned);
      }, 30000);
    });
  } catch (err) {
    console.warn('Rewarded ad failed to show', err);
    return false;
  }
}

const styles = StyleSheet.create({
  adContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
});

