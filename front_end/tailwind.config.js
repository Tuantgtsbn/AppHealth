/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ['./app/**/*.{js,jsx,ts,tsx}', './global.css'],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            fontFamily: {
                // Định nghĩa font mặc định
                sans: ['Poppins-Regular'],
                // Các biến thể khác
                'poppins-medium': ['Poppins-Medium'],
                'poppins-semibold': ['Poppins-SemiBold'],
                'poppins-bold': ['Poppins-Bold']
            },
            colors: {
                primary: '#F00E46',
                secondary: '#EDEDED'
            }
        }
    },
    plugins: []
};
