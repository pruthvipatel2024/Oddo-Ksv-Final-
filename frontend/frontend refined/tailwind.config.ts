import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand — "Transit Teal" system
        teal: {
          50: "#EAF6F5",
          100: "#CBEAE8",
          200: "#9AD8D4",
          300: "#63C1BB",
          400: "#33A6A0",
          500: "#0E7C7B", // primary
          600: "#0B6564",
          700: "#0A5150",
          800: "#083F3F",
          900: "#062F2F",
        },
        amber: {
          50: "#FEF6E9",
          100: "#FCE8C2",
          200: "#F9D48F",
          300: "#F6BE5C",
          400: "#F2A93B", // accent
          500: "#E0921E",
          600: "#B87516",
        },
        ink: {
          50: "#F7F8FA",
          100: "#ECEEF2",
          200: "#D8DCE3",
          300: "#B4BAC6",
          400: "#8890A0",
          500: "#5B6474",
          600: "#3D4453",
          700: "#272C38",
          800: "#181B24",
          900: "#0F1218",
          950: "#0A0C10",
        },
        success: "#2FAE60",
        danger: "#E4572E",
        warning: "#F2A93B",
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "route-line":
          "repeating-linear-gradient(90deg, currentColor 0, currentColor 6px, transparent 6px, transparent 14px)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,18,24,0.04), 0 8px 24px -12px rgba(15,18,24,0.12)",
        "soft-lg": "0 4px 12px rgba(15,18,24,0.06), 0 24px 48px -24px rgba(15,18,24,0.22)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "drive-in": {
          "0%": { transform: "translateX(-12px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "drive-in": "drive-in 0.5s ease-out",
        "fade-up": "fade-up 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
