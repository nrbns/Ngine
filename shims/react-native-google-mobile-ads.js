// Simple shim for react-native-google-mobile-ads to avoid bundling native components on web
const TestIds = {
  BANNER: 'test-banner',
  REWARDED: 'test-rewarded',
};

function BannerAd(props) {
  // Render nothing on web
  return null;
}

const BannerAdSize = {
  BANNER: 'BANNER',
};

function RewardedAd() {
  return {
    addAdEventListener: () => () => {},
    load: () => {},
    show: () => {},
  };
}

module.exports = {
  TestIds,
  BannerAd,
  BannerAdSize,
  RewardedAd: {
    createForAdRequest: () => RewardedAd(),
  },
};