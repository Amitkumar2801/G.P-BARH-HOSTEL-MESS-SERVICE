/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gp-blue': '#003366', // College Dark Blue
        'gp-light': '#f0f4f8', // Light Background Blue
      }
    },
  },
  plugins: [],
}