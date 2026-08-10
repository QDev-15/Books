/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae3fe',
          300: '#7cc7fd',
          400: '#38a8fa',
          500: '#0c8cee',
          600: '#0070cd',
          700: '#0559a6',
          800: '#084787',
          900: '#0b3a6e',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
