/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          55: '#f6f7f9',
          105: '#eceef1',
          150: '#ebebeb',
          250: '#dcdcdc',
          350: '#c4c4c4',
          405: '#909090',
          450: '#858b97',
          550: '#5a5a5a',
          650: '#414b5a',
          750: '#2b3544',
          850: '#18202e',
        },
        blue: {
          550: '#2d71ee',
          650: '#2158e3',
        },
        indigo: {
          550: '#5956ec',
          650: '#493ecd',
        },
        purple: {
          650: '#882bd6',
        },
        slate: {
          350: '#b0bdcd',
          650: '#3d4b5f',
        },
        teal: {
          450: '#20c6b3',
          550: '#10a697',
          650: '#0e857d',
        },
        orange: {
          450: '#fa8229',
          550: '#f16511',
        },
        yellow: {
          250: '#fde868',
          450: '#f2bf0e',
          650: '#b57605',
        },
        amber: {
          450: '#f8ae17',
        },
        emerald: {
          250: '#8beec3',
          450: '#22c58e',
        }
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(59, 130, 246, 0.15)' },
          '50%': { boxShadow: '0 0 24px rgba(59, 130, 246, 0.4)' }
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        float: 'float 3.5s ease-in-out infinite',
        glow: 'glow 2.5s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }
    }
  },
  plugins: [],
}
