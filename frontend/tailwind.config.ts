import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [typography],
  theme: {
    extend: {
      colors: {
        selected: "var(--selected)",
        background: "var(--background)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "var(--mantine-color-dark-0)",
            "*": { color: "var(--mantine-color-dark-0)" },
          },
        },
      }
    },
  },
} satisfies Config;
