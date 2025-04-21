module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
            'nativewind/babel'
        ],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./'],
                    alias: {
                        '@': './app',
                        '@assets': './assets',
                        '@hooks/*': './hooks',
                        '@contexts/*': './contexts',
                        '@types/*': './types',
                        '@services/*': './services',
                        '@config/*': './config'
                    }
                }
            ]
        ]
    };
};
