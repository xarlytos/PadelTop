const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure .js is preferred over .mjs to avoid import.meta issues in Metro
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'mjs');

module.exports = config;
