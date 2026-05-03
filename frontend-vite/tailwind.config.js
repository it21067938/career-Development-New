/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter:  ["Inter", "sans-serif"],
      },
      colors: {
        primary: {
          50:  "#EFF6FF",
          100: "#DBEAFE",
          200: "#BEDBFF",
          300: "#8EC5FF",
          400: "#51A2FF",
          500: "#2B7FFF",
          600: "#155DFC",
          700: "#1447E6",
          800: "#193CB8",
          900: "#1C398E",
          950: "#162456",
        },
        success: {
          50:  "#F0FDF4",
          100: "#DCFCE7",
          200: "#B9F8CF",
          300: "#7BF1A8",
          400: "#05DF72",
          500: "#31C950",
          600: "#2AA63E",
          700: "#178236",
          800: "#016630",
          900: "#0D542B",
          950: "#032E15",
        },
        danger: {
          50:  "#FEF2F2",
          100: "#FFE2E2",
          200: "#FFC9C9",
          300: "#FFA2A2",
          400: "#FF6467",
          500: "#FB2C36",
          600: "#E7180B",
          700: "#C11007",
          800: "#9F0712",
          900: "#82181A",
          950: "#460809",
        },
        gray: {
          50:  "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DC",
          400: "#99A1AF",
          500: "#6A7282",
          600: "#4A5565",
          700: "#364153",
          800: "#1E2939",
          900: "#101828",
          950: "#030712",
        },
      },
      animation: {
        "slide-in": "slideIn .2s ease",
        "fade-in":  "fadeIn .3s ease",
      },
      keyframes: {
        slideIn: {
          from: { transform: "translateX(12px)", opacity: "0" },
          to:   { transform: "translateX(0)",    opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}