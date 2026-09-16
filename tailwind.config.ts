import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dạng rgb(var(--x-rgb) / <alpha-value>) để các tiện ích như bg-ink/50,
        // placeholder:text-ink-soft/70 ghép được độ mờ — var(--x) hex thường thì không.
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        card: "rgb(var(--card-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        "ink-soft": "rgb(var(--ink-soft-rgb) / <alpha-value>)",
        indigo: "rgb(var(--indigo-rgb) / <alpha-value>)",
        moss: "rgb(var(--moss-rgb) / <alpha-value>)",
        turmeric: "rgb(var(--turmeric-rgb) / <alpha-value>)",
        line: "var(--line)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(35 48 58 / 0.04), 0 8px 24px -12px rgb(35 48 58 / 0.18)",
        lift: "0 2px 4px rgb(35 48 58 / 0.05), 0 18px 40px -16px rgb(35 48 58 / 0.28)",
      },
      maxWidth: {
        shell: "1200px",
        prose: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
