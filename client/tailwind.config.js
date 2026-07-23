/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Sora', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#071018',
          900: '#0b1724',
          800: '#122334',
          700: '#1a3348',
        },
        bone: {
          50: '#f7f5f1',
          100: '#efeae2',
          200: '#e2d8c8',
        },
        signal: {
          DEFAULT: '#1faa8a',
          soft: '#d8f3ea',
          deep: '#0f6f5c',
        },
        copper: {
          DEFAULT: '#c9783a',
          soft: '#f3e0cf',
        },
      },
      animation: {
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'float-mid': 'floatMid 5.5s ease-in-out infinite',
        'rise': 'rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'orbit': 'orbit 18s linear infinite',
        'orbit-rev': 'orbitRev 24s linear infinite',
        'pulse-line': 'pulseLine 2.4s ease-in-out infinite',
        'reveal-up': 'revealUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'soft-blink': 'softBlink 2s ease-in-out infinite',
        'sheen': 'sheen 2.8s ease-in-out infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) rotateX(12deg) rotateY(-18deg)' },
          '50%': { transform: 'translateY(-14px) rotateX(16deg) rotateY(-12deg)' },
        },
        floatMid: {
          '0%, 100%': { transform: 'translateY(0) rotateX(8deg) rotateY(14deg)' },
          '50%': { transform: 'translateY(-10px) rotateX(4deg) rotateY(20deg)' },
        },
        rise: {
          from: { opacity: 0, transform: 'translateY(28px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        orbit: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        orbitRev: {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        pulseLine: {
          '0%, 100%': { transform: 'scaleX(0.55)', opacity: 0.45 },
          '50%': { transform: 'scaleX(1)', opacity: 1 },
        },
        revealUp: {
          from: { opacity: 0, transform: 'translateY(40px) scale(0.98)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        softBlink: {
          '0%, 100%': { opacity: 0.45 },
          '50%': { opacity: 1 },
        },
        sheen: {
          '0%': { backgroundPosition: '-120% 0' },
          '100%': { backgroundPosition: '220% 0' },
        },
      },
    },
  },
  plugins: [],
}
