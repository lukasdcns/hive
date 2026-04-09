import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hive: {
          bg: '#12100e',
          surface: '#1a1712',
          input: '#211e19',
          hover: '#2d2822',
          border: '#3d3830',
          accent: '#f5a623',
          'accent-hover': '#d4861a',
          text: '#f0ebe3',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
