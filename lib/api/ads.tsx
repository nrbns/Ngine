import React from 'react'
import { Platform } from 'react-native'

// This file should NOT be imported on web - Metro should use ads.web.tsx instead
// If you see this error, Metro's platform resolution isn't working correctly

// For web, this should never execute because Metro should resolve to ads.web.tsx
// But we add a safety check just in case
export const BannerAdComponent: React.FC = () => {
  // Early return for web platform
  if (Platform.OS === 'web') {
    return null
  }

  // Native-only code
  const [AdComponent, setAdComponent] = React.useState<React.ReactElement | null>(null)

  React.useEffect(() => {
    // Double check platform
    if (Platform.OS === 'web') {
      return
    }

    // Use eval to prevent Metro from analyzing this require at build time
    // This is a workaround for Metro's static analysis
    const loadAdMob = () => {
      try {
        // Use Function constructor to prevent static analysis
        const requireAdMob = new Function('return require("react-native-google-mobile-ads")')
        const AdMobModule = requireAdMob()
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

