const {getDefaultConfig} = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add the crypto polyfill
defaultConfig.resolver.extraNodeModules = {
    ...defaultConfig.resolver.extraNodeModules,
    crypto: require.resolve('react-native-crypto'),
    stream: require.resolve('readable-stream'), // Some crypto functions need tbhis
    assert: require.resolve('assert'),
};

module.exports = defaultConfig;