/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mpl: {
          primary: '#0a192f',
          secondary: '#112240',
          accent: '#64ffda',
          gold: '#FFD700',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
          dark: '#020c1b'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif']
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'zoom-in': 'zoom-in 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' }
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(100, 255, 218, 0.5)',
            filter: 'brightness(1)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(100, 255, 218, 0.8)',
            filter: 'brightness(1.2)'
          }
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(100, 255, 218, 0.1), transparent)'
      }
    },
  },
  plugins: [],
}