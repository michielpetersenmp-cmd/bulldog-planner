import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a2e5a",
          light: "#243f7a",
          dark: "#111e3a",
        },
        accent: {
          DEFAULT: "#F5C842",
          light: "#f7d36a",
          dark: "#d4a820",
        },
        bg: "#f7f5f0",
        surface: "#ffffff",
        cream: "#f7f5f0",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(26,46,90,0.08)",
        card: "0 2px 12px rgba(26,46,90,0.10)",
        hover: "0 8px 32px rgba(26,46,90,0.14)",
      },
      // Veilige zones voor mobiel (notch, home indicator)
      spacing: {
        safe: "env(safe-area-inset-bottom)",
      },
    },
  },
  plugins: [],
};
export default config;
