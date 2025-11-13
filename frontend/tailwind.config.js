/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1F7A8C",
          secondary: "#FF6F59",
          accent: "#FFCA3A",
        },
        surface: {
          base: "#FFFFFF",
          muted: "#F6F7FB",
        },
        slate: {
          950: "#101820",
          900: "#1F2933",
          600: "#52616B",
        },
        feedback: {
          success: "#2EC4B6",
          warning: "#FFA600",
          danger: "#E63946",
        },
      },
      fontFamily: {
        heading: ["'Nunito Sans'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
