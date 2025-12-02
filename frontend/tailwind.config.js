/* eslint-env node */
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic Colors
        primary: colors.emerald,   // Main brand color (Green for Volunteer)
        secondary: colors.blue,    // Secondary actions (Blue for Trust)
        accent: colors.orange,     // Highlights/Call to actions
        
        // Surface Colors
        surface: {
          base: "#FFFFFF",
          muted: "#F8FAFC",        // Slate 50
          highlight: "#F1F5F9",    // Slate 100
        },
        
        // Text Colors (Semantic)
        text: {
          main: "#0F172A",         // Slate 900
          secondary: "#475569",    // Slate 600
          muted: "#94A3B8",        // Slate 400
          inverted: "#FFFFFF",
        },

        // Feedback Colors
        success: colors.emerald,
        warning: colors.amber,
        danger: colors.rose,
        info: colors.sky,

        // Legacy/Specific Brand Colors (Optional, keeping for backward compatibility if needed)
        brand: {
          primary: "#1F7A8C",
          secondary: "#FF6F59",
          accent: "#FFCA3A",
        },
      },
      fontFamily: {
        heading: ["'Nunito Sans'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 15px rgba(16, 185, 129, 0.3)', // Emerald glow
      }
    },
  },
  plugins: [],
};
