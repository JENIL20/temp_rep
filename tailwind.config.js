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
          'navy': '#1B3A5C',
          'navy-light': '#2D4E73',
          'navy-dark': '#0F2338',
        },
        secondary: {
          'gold': '#C89650',
          'gold-light': '#D4A873',
          'gold-dark': '#B17E3A',
        },
      },
    },
  },
  plugins: [],
}