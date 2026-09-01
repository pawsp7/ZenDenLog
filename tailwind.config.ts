import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#fbf7f0",
          100: "#f4eee3",
          200: "#e8dcc6",
        },
        moss: {
          700: "#2c4a3e",
          800: "#1f352c",
          900: "#16251f",
        },
        clay: {
          500: "#c45c26",
          600: "#a64b1d",
        },
        sage: {
          400: "#8fad9a",
          500: "#6e907c",
        },
        ink: "#1c1917",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        lift: "0 18px 40px -24px rgba(28, 25, 23, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
