const { getDefaultConfig } = require("expo/metro-config");
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  crypto: require.resolve("react-native-crypto"),
  stream: require.resolve("stream-browserify"),
  url: require.resolve("url"),
  buffer: require.resolve("@craftzdog/react-native-buffer"),
  events: require.resolve("events"),
  http: require.resolve("stream-http"),
  https: require.resolve("https-browserify"),
  os: require.resolve("os-browserify/browser"),
  process: require.resolve("process/browser"),
  "process/browser": require.resolve("process/browser"),
};

module.exports = defaultConfig;
