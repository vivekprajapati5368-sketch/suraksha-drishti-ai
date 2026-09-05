/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 14s linear infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'radar': 'radar 6s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-150%) skewX(-25deg)' },
          '100%': { transform: 'translateX(250%) skewX(-25deg)' }
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5', filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))' }
        }
      },
      colors: {
        command: {
          950: '#050b17',
          900: '#0a1428',
          850: '#0e1d3b',
          800: '#14274e',
          700: '#1c386e',
          600: '#274e99',
          accent: '#3b82f6'
        },
        cyberblue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        cyberyellow: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          accent: '#fbbf24'
        },
        risk: {
          red: '#ef4444',
          orange: '#f97316',
          amber: '#f59e0b',
          green: '#10b981'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        tech: ['"Space Grotesk"', '"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
