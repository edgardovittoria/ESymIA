/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primaryColor': '#184043',
        'secondaryColor': '#29686E',
        'shadowColor': '#c8c8c8'
      },
    },
  },
  plugins: [],
  important: true
}