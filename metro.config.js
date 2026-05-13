const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolve platform-hooks to our local shim
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'platform-hooks': path.resolve(__dirname, 'platform-hooks'),
};

// Make sure Metro watches the platform-hooks folder
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(__dirname, 'platform-hooks'),
];

module.exports = config;
