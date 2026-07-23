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
      },
    },
  },
  plugins: [],
}
