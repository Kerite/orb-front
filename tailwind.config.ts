import { heroui } from "@heroui/react";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        accent: "var(--accent-color)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        normal: "var(--text-color)",
      },
      backgroundImage: {
        'bg-home': "url('../public/bg-home.png')"
      },
    },
    fontFamily: {
      'inter': ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
      'geist-sans': ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
      'geist-mono': ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      'orbitron': ['var(--font-orbitron)', 'ui-sans-serif', 'sans-serif'],
    }
  },
  darkMode: "class",
  plugins: [heroui()],
} satisfies Config;
