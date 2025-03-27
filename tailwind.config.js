/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}" , "./components/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "poppins": ["Poppins-Regular", "sans-serif"],
          "Poppins-Black": ["Poppins-Black", "sans-serif"],
          "Poppins-bold": ["Poppins-Bold", "sans-serif"],
          "Poppins-light": ["Poppins-Light", "sans-serif"],
          "Poppins-medium": ["Poppins-Medium", "sans-serif"],
          "Poppins-semibold": ["Poppins-SemiBold", "sans-serif"],
          "Poppins-Thin": ["Poppins-Thin", "sans-serif"],
      },
      colors:{
        primary: {
          100: "#B5C8FF",
          200: "#263D7F",
          300: "#000B2B",
        },
      }
    },
  },
  plugins: [],
}