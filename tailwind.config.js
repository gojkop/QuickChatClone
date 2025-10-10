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

        // Semantic aliases
        primary: '#4F46E5',
        accent: '#7C3AED',
        ink: '#111827',
        subtext: '#4B5563',
        surface: '#FFFFFF',
        canvas: '#F9FAFB',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        'elev-1': '0 1px 2px rgba(17,24,39,0.06)',
        'elev-2': '0 2px 6px rgba(17,24,39,0.08)',
        'elev-3': '0 6px 16px rgba(17,24,39,0.10)',
        'elev-4': '0 12px 24px rgba(17,24,39,0.12)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '240ms',
        slow: '400ms',
      },
    },
  },
  plugins: [],
}
