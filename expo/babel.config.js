// babel.config.js
// CRITICAL: Metro looks for .js not .cjs for EAS builds
// CRITICAL: Reanimated plugin MUST be last
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      'react-native-reanimated/plugin', // ← MUST be last
    ],
  };
};
