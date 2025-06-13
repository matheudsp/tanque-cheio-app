const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add this to exclude .ts files that aren't routes
config.resolver.sourceExts = process.env.RN_SRC_EXT
  ? [...process.env.RN_SRC_EXT.split(","), ...config.resolver.sourceExts]
  : config.resolver.sourceExts;


config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Exclude .d.ts and other non-route files
config.resolver.assetExts.push("d.ts");

module.exports = config;
