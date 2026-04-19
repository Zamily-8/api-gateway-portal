/** @type {import('tailwindcss').Config} */
export default {
  // "class" = Tailwind activera dark mode quand la classe "dark"
  // est présente sur l'élément <html>
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}