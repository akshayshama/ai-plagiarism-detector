/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cyber: {
          bg: '#05060f',
          surface: '#0b0d1a',
          border: 'rgba(148, 163, 255, 0.12)',
          primary: '#7c5cff',
          accent: '#00e5ff',
          success: '#22e584',
          warn: '#ffb020',
          danger: '#ff4d6d',
          text: '#e8eaff',
          muted: '#8b90b0',
        },
      },
      boxShadow: {
        neon: '0 0 20px rgba(124, 92, 255, 0.35), 0 0 60px rgba(124, 92, 255, 0.12)',
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.35), 0 0 60px rgba(0, 229, 255, 0.12)',
        'neon-green': '0 0 20px rgba(34, 229, 132, 0.35), 0 0 60px rgba(34, 229, 132, 0.12)',
      },
      keyframes: {
        'grid-pan': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '60px 60px' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(240px)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
      },
      animation: {
        'grid-pan': 'grid-pan 8s linear infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
        scan: 'scan 2.2s ease-in-out infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        blink: 'blink 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
