import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hive: {
          bg: '#121113',
          surface: '#222725',
          input: '#1a1d1a',
          hover: '#2d312e',
          border: '#3a3f3b',
          accent: '#899878',
          'accent-hover': '#6b7a5e',
          text: '#f7f7f2',
          muted: '#e4e6c3',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
