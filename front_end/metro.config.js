const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('cjs');
config.resolver.sourceExts.push('json');
config.resolver.assetExts.push('bin'); // thêm 'bin' vào thôi, không ghi đè

// Đảm bảo json không nằm trong assetExts để Metro xử lý nó như module
const jsonExtIndex = config.resolver.assetExts.indexOf('json');
if (jsonExtIndex !== -1) {
    config.resolver.assetExts.splice(jsonExtIndex, 1);
}

module.exports = config;
module.exports = withNativeWind(config, { input: './global.css' });
