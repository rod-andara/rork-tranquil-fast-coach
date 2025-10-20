module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Only load NativeWind plugin for native platforms, not web
      process.env.EXPO_TARGET === 'web' ? null : 'nativewind/babel'
    ].filter(Boolean)
  };
};
