// Ads Integration - Safe and controlled
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { View, StyleSheet } from 'react-native';
import { ReactElement } from 'react';

// Use test IDs for development
const BANNER_AD_UNIT_ID = __DEV__ 
  ? TestIds.BANNER 
  : process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || 'ca-app-pub-xxx';

const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID || 'ca-app-pub-xxx';

// Dashboard Banner Ad Component
export function DashboardAd(): ReactElement {
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
  // TODO: Implement rewarded ad logic
  // This requires native module setup
  console.log('Show rewarded ad');
  return Promise.resolve(true);
}

const styles = StyleSheet.create({
  adContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
});

