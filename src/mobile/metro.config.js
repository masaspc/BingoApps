const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure the minifier to preserve class names
// This is required because expo-modules-core's registerWebModule
// relies on class.name being available
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer?.minifierConfig,
    keep_classnames: true,
    keep_fnames: true,
  },
};

module.exports = config;
