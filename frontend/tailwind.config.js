/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,cjs,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-indigo': '#2C3E50',
        'rose-quartz': '#F7CAC9',
        'sage-green': '#9DC88D',
        'cream': '#F5F5F5',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 