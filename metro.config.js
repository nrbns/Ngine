// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Prioritize .web extensions for web platform (must be BEFORE regular extensions)
config.resolver.sourceExts = ['web.tsx', 'web.ts', ...config.resolver.sourceExts];

// Block Jimp completely - it causes MIME errors and isn't needed
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  /node_modules\/jimp-compact\/.*/,
  /node_modules\/@jimp\/.*/,
  /jimp.*/,
];

// Fix for react-native-reanimated/worklets on web and block Jimp completely
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block Jimp completely for all platforms - causes MIME errors
  if (
    moduleName.includes('jimp') || 
    moduleName.includes('@jimp') ||
    moduleName.includes('jimp-compact') ||
    moduleName === 'jimp' ||
    moduleName === '@jimp/core' ||
    moduleName === '@jimp/utils' ||
    moduleName.startsWith('jimp/') ||
    moduleName.startsWith('@jimp/')
  ) {
    return {
      type: 'empty',
    };
  }
  
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
  }
  
  // Use default resolver
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  // Fallback to default
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

