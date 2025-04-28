// metro.config.js

const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('bin'); // thêm 'bin' vào thôi, không ghi đè

module.exports = config;
