import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        accent: "#f97316",
        cream: "#fdf6ec",
        slate: "#334155",
        sand: "#f5e9d7",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 18px 60px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(249, 115, 22, 0.15), transparent 35%), linear-gradient(135deg, rgba(20, 33, 61, 0.96), rgba(15, 23, 42, 1))",
      },
    },
  },
  plugins: [],
};

export default config;

