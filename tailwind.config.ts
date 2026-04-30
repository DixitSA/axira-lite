import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
        },
        status: {
          scheduled: {
            bg: "#dbeafe",
            text: "#1d4ed8",
          },
          pending: {
            bg: "#fef3c7",
            text: "#b45309",
          },
          completed: {
            bg: "#dcfce7",
            text: "#15803d",
          },
          overdue: {
            bg: "#fee2e2",
            text: "#b91c1c",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
