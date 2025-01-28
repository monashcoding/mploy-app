import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
  theme: {
    extend: {
      colors: {
        selected: "var(--selected)",
        background: "var(--background)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
      },
    },
  },
} satisfies Config;
