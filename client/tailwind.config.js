/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          black:  '#020409',
          dark:   '#0a0f1e',
          panel:  '#0d1526',
          border: '#1a2744',
          neon:   '#00f5a0',
          blue:   '#00c8ff',
          purple: '#9b30ff',
          red:    '#ff2d55',
          yellow: '#ffd60a',
          text:   '#c8d8f0',
          muted:  '#4a6080',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        neon:   '0 0 8px #00f5a0, 0 0 20px #00f5a044',
        blue:   '0 0 8px #00c8ff, 0 0 20px #00c8ff44',
        purple: '0 0 8px #9b30ff, 0 0 20px #9b30ff44',
        red:    '0 0 8px #ff2d55, 0 0 20px #ff2d5544',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'scan': 'scan 4s linear infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
};
