/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-indigo': '#4F46E5',
        'brand-violet': '#7C3AED',
        'brand-dark': '#111827',
        'brand-gray': '#4B5563',
        'brand-light-gray': '#F9FAFB',
      }
    },
  },
  plugins: [],
}