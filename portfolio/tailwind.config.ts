import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a09",
        "ink-raised": "#141312",
        paper: "#f3efe6",
        "paper-dim": "#8f8b81",
        amber: {
          DEFAULT: "#c9974d",
          bright: "#e0b876",
          dim: "#8a6a3d",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      maxWidth: {
        content: "1240px",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.15" },
          "50%": { opacity: "0.9" },
        },
        "marquee-left": {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(-50%)" },
        },
        "marquee-right": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0%)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        dashflow: {
          to: { strokeDashoffset: "-24" },
        },
      },
      animation: {
        twinkle: "twinkle 4s ease-in-out infinite",
        "marquee-left": "marquee-left var(--marquee-duration, 30s) linear infinite",
        "marquee-right": "marquee-right var(--marquee-duration, 30s) linear infinite",
        blink: "blink 1s step-end infinite",
        dashflow: "dashflow 1.1s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
