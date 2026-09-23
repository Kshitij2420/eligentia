/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0F19',
        surface: '#131826',
        raised: '#1B2333',
        line: '#252E42',
        fog: '#8891A5',
        paper: '#EDEFF4',
        signal: '#F2B705',
        'signal-deep': '#C98E03',
        eligible: '#34D399',
        blocked: '#FB7185',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
