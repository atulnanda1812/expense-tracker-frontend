/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all relevant files in the src folder
    "./public/index.html",        // Include the main HTML file
  ],
  theme: {
    extend: {},                   // You can customize your theme here
  },
  plugins: [],                     // Add any Tailwind plugins here if required
};
