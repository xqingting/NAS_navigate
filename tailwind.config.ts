import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', '"DM Sans"', "sans-serif"],
      },
      colors: {
        midnight: "#0b1224",
        panel: "rgba(255,255,255,0.06)",
        accent: "#22d3ee",
        amber: "#f59e0b",
      },
      boxShadow: {
        glow: "0 10px 60px rgba(34, 211, 238, 0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
