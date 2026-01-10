// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Prioritize .web extensions for web platform (must be BEFORE regular extensions)
config.resolver.sourceExts = ['web.tsx', 'web.ts', ...config.resolver.sourceExts];

// Fix for react-native-reanimated/worklets on web
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Skip worklets threads module on web (worklets don't work on web)
  if (platform === 'web') {
    // Match the exact path that's failing
    if (
      moduleName.includes('react-native-worklets/lib/module/threads') ||
      moduleName.endsWith('/threads') ||
      (moduleName.includes('react-native-worklets') && moduleName.includes('threads'))
    ) {
      return {
        type: 'empty',
      };
    }
    // Skip Jimp image processing for web (causes MIME errors)
    if (moduleName.includes('jimp') || moduleName.includes('@jimp')) {
      return {
        type: 'empty',
      };
    }
  }
  // Use default resolver
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  // Fallback to default
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

