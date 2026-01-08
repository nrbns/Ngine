// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Prioritize .web extensions for web platform (must be BEFORE regular extensions)
config.resolver.sourceExts = ['web.tsx', 'web.ts', ...config.resolver.sourceExts];

module.exports = config;

