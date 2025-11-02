// babel.config.js
// CRITICAL: Metro looks for .js not .cjs for EAS builds
// CRITICAL: Reanimated plugin MUST be last
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      'nativewind/babel',
      'react-native-reanimated/plugin', // ← MUST be last
    ],
  };
};
