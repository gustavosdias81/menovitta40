/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rosa': {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4a9b8',
          400: '#ec7a93',
          500: '#B76E79',
          600: '#a55d67',
          700: '#8a4d56',
          800: '#734149',
          900: '#623a41',
        },
        'ouro': {
          50: '#fdfaed',
          100: '#faf3d1',
          200: '#f4e5a0',
          300: '#edd46e',
          400: '#D4AF37',
          500: '#c49b2a',
          600: '#a67a20',
          700: '#885c1d',
          800: '#714a1f',
          900: '#613e1f',
        },
        'offwhite': '#F9F9F9',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
