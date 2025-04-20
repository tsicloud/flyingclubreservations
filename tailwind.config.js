/**** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Add custom colors here, e.g. brand: '#2563eb'
      },
    },
  },
  plugins: [],
};
