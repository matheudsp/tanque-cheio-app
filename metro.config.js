const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add this to exclude .ts files that aren't routes
config.resolver.sourceExts = process.env.RN_SRC_EXT
  ? [...process.env.RN_SRC_EXT.split(","), ...config.resolver.sourceExts]
  : config.resolver.sourceExts;

// Exclude .d.ts and other non-route files
config.resolver.assetExts.push("d.ts");

module.exports = config;
