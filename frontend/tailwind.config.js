/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,cjs,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-indigo': '#1f2f46',
        'rose-quartz': '#e84f9f',
        'sage-green': '#22b983',
        'cream': '#f7f5f9',
        'sunrise': '#f1b329',
        'mist': '#f9eef4',
        'ink': '#1f2f46',
        'muted': '#7f90a8',
        'line': '#e7ebf2',
        'soft-lilac': '#f2ecfb',
        'soft-peach': '#fbeff2',
        'soft-lemon': '#f8f2dc',
        'soft-cyan': '#e8f5fb',
      },
      fontFamily: {
        'display': ['Sora', 'sans-serif'],
        'body': ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(31, 47, 70, 0.08)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 420ms ease-out both',
      },
    },
  },
  plugins: [],
} 
