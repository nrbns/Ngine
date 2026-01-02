const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.resolver = config.resolver || {};
  config.resolver.extraNodeModules = {
    ...(config.resolver.extraNodeModules || {}),
    'react-native-google-mobile-ads': path.resolve(__dirname, 'shims', 'react-native-google-mobile-ads.js'),
  };

  // Block the native package from being resolved / bundled (helps prevent native component errors on web)
  config.resolver.blockList = exclusionList([/.*\/node_modules\/react-native-google-mobile-ads\/.*$/]);

  return config;
})();