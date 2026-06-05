import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          DEFAULT: '#00FF87',
          dim: '#00CC6A',
        },
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFE566',
          dim: '#B8960C',
        },
        pitch: {
          950: '#030712',
          900: '#0A0F1E',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
        },
        result: {
          win: '#00FF87',
          lose: '#FF4444',
          draw: '#94A3B8',
        },
        status: {
          scheduled: '#3B82F6',
          live: '#EF4444',
          pending: '#F59E0B',
          settled: '#6B7280',
          postponed: '#8B5CF6',
          void: '#374151',
        },
      },
      fontFamily: {
        display: ['var(--font-oswald)', 'Impact', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        'score': ['4.5rem', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '400' }],
        'hero': ['3rem', { lineHeight: '1', letterSpacing: '0.08em' }],
        'section': ['1.75rem', { lineHeight: '1.1', letterSpacing: '0.06em' }],
      },
      borderRadius: {
        'card': '12px',
        'pill': '999px',
        'chip': '6px',
      },
      boxShadow: {
        'neon': '0 0 20px #00FF8766, 0 0 40px #00FF8733',
        'neon-sm': '0 0 8px #00FF8799',
        'gold': '0 0 20px #FFD70066, 0 0 40px #FFD70033',
        'card': '0 4px 24px rgba(0,0,0,0.6)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px #00FF8733',
      },
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 #EF444466' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 8px #EF444400' },
        },
        'neon-flicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.6' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'rank-change': {
          '0%': { backgroundColor: '#00FF8722' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        'pulse-live': 'pulse-live 1.5s ease-in-out infinite',
        'neon-flicker': 'neon-flicker 3s linear infinite',
        'slide-up': 'slide-up 0.2s ease-out',
        'rank-change': 'rank-change 1.5s ease-out',
      },
      backgroundImage: {
        'stadium-gradient': 'radial-gradient(ellipse at 50% 0%, #0F2027 0%, #0A0F1E 60%, #030712 100%)',
        'card-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'neon-gradient': 'linear-gradient(90deg, #00FF87, #00CC6A)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700, #B8960C)',
      },
    },
  },
  plugins: [],
}

export default config