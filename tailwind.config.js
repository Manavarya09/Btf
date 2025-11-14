/** JavaScript Tailwind config kept in sync with `tailwind.config.ts` */

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-brown": "#523122",
        "mid-brown": "#a26833",
        "light-brown": "#e3a458",
        "red-brown": "#7f3b2d",
        "yellow-brown": "#a26833",
        "milk-yellow": "#e3d3bc",
        "milk": "#faeade",
        "dark-bg": "#222123",
        "dark-secondary": "#232224",
        "surface-light": "#fafaf9",
        "surface": "#f5f5f4",
        "surface-dark": "#e8e8e7",
        "text-primary": "#1f1f1f",
        "text-secondary": "#78716c",
        "text-tertiary": "#a89968",
        "accent-warm": "#c97c3f",
        "accent-teal": "#4a7c7e",
        "accent-rust": "#a84632",
        "border-color": "#e2ddd7",
        "bg-dark": "#1c1c1c",
        "bg-dark-secondary": "#2a2a2a",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        paragraph: ["var(--font-paragraph)", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        30: "7.5rem",
        50: "12.5rem",
        70: "17.5rem",
        72: "18rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "soft-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "soft-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "soft-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.5s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

module.exports = config;
