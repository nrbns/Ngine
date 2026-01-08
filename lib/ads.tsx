import { Platform } from 'react-native'
import React from 'react'

// Banner Ad - Safe placement for earning
// Only render on native platforms, not web
export const BannerAdComponent: React.FC = () => {
  // Skip ads on web platform
  if (Platform.OS === 'web') {
    return null
  }

  // Only load on native platforms using lazy loading
  const [AdComponent, setAdComponent] = React.useState<React.ReactElement | null>(null)

  React.useEffect(() => {
    // Only load on native platforms
    if (Platform.OS === 'web') {
      return
    }

    // Lazy load AdMob to prevent web bundler from resolving it
    const loadAdMob = async () => {
      try {
        // Use require inside async function to prevent static analysis
        const AdMobModule = await Promise.resolve().then(() => 
          require('react-native-google-mobile-ads')
        )
        
        const { BannerAd, BannerAdSize, TestIds } = AdMobModule
        const adUnitId = __DEV__
          ? TestIds.BANNER
          : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy'
        
        setAdComponent(
          React.createElement(BannerAd, {
            unitId: adUnitId,
            size: BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
            requestOptions: {
              requestNonPersonalizedAdsOnly: false,
            },
          })
        )
      } catch (error) {
        console.warn('AdMob not available:', error)
      }
    }

    loadAdMob()
  }, [])

  return AdComponent
}

// Rewarded Ad - High eCPM for gallery uploads
export const showRewardedAd = async () => {
  // Implementation for rewarded ads
  // This will be integrated with AdMob rewarded ads
  console.log('Rewarded ad would show here')
}

