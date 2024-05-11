/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primmary: '#46b98d', // #26f064
        secondary: '#60A5FA',
        text: '#02200a', // #0B0E15
        background: '#f9fafb', // #edfef1
        accent: '#fc5e53'
      },
      fontSize: {
        mh: '34px',
      },
    },
  },
  plugins: [],
};
