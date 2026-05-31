/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,cjs,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-indigo': '#17233a',
        'rose-quartz': '#c9476d',
        'sage-green': '#1d8f6f',
        'cream': '#f8f7f4',
        'sunrise': '#b77812',
        'mist': '#eef4f3',
        'ink': '#17233a',
        'muted': '#607084',
        'line': '#dce4e8',
        'soft-lilac': '#eef0f6',
        'soft-peach': '#f7ebe7',
        'soft-lemon': '#f7f0d8',
        'soft-cyan': '#e8f3f4',
        'clinical-blue': '#2d6f8f',
        'surface': '#ffffff',
        'danger': '#b4233c',
      },
      fontFamily: {
        'display': ['Sora', 'sans-serif'],
        'body': ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 28px rgba(23, 35, 58, 0.08)',
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
