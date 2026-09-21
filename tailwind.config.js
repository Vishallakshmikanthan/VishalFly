/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#090a0f',
          900: '#0e1117',
          850: '#141822',
          800: '#1b202c',
          700: '#283042',
        },
        amber: {
          glow: '#ff9e00',
          warm: '#ffaa33',
        },
        bedroom: {
          wall: '#1e232a',
          accent: '#ff5e1a',
          wood: '#443022',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
