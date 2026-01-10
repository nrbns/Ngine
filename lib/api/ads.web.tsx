import React from 'react'
import { View } from 'react-native'

// Web version - no ads support
export const BannerAdComponent: React.FC = () => {
  // Return null on web - no ads
  return null
}

export const showRewardedAd = async () => {
  console.log('Rewarded ads not available on web')
}

