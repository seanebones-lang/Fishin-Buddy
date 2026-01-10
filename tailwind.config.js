const { fontFamily } = require('tailwindcss/defaultTheme') /** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003a75',
        },
        success: '#00cc66',
        warning: '#ffaa00',
        frenzy: '#ff4444',
        gradient: {
          start: '#001a33',
          end: '#004080',
        },
      },
      fontFamily: {
        'logo': ['System', ...fontFamily.sans],
        'bold': ['System-Bold'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 0.6s linear',
        'tug': 'tug 0.3s ease-in-out',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: 1 },
          '100%': { transform: 'scale(4)', opacity: 0 },
        },
        tug: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(2px)' },
        },
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0,102,204,0.15)',
        'gauge': '0 0 30px rgba(0,204,102,0.4)',
      },
    },
  },
  plugins: [],
};