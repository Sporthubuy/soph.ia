import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'azure': {
          DEFAULT: '#5B9BFF',
          light: '#8BB9FF',
          dark: '#3B7FFF',
        },
        'sky': {
          50: '#F0F7FF',
          100: '#E0F0FF',
          200: '#BAD5FF',
        },
        'star': {
          50: '#F3F1FF',
          100: '#EAE3FF',
          200: '#D9CFFF',
        },
      },
      fontFamily: {
        grotesk: ['Hanken Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-azure': 'linear-gradient(to right, #5B9BFF, #8BB9FF)',
        'gradient-mesh': 'linear-gradient(to bottom right, rgba(91, 155, 255, 0.2), transparent, rgba(244, 63, 94, 0.1))',
      },
      boxShadow: {
        'glow-azure': '0 0 20px rgba(91, 155, 255, 0.3)',
        'glow-azure-lg': '0 0 40px rgba(91, 155, 255, 0.4)',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
        gradient: 'gradient 3s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}

export default config
