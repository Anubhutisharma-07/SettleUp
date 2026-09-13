/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#00A878',
        danger: '#FF5C5C',
      },
    },
  },
  plugins: [],
}