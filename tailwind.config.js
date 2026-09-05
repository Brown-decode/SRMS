/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors (unchanged for dark mode)
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563EB",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },

        // Semantic Colors (unchanged for dark mode)
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },

        // Success text colors for dark theme
        "success-text": {
          200: "#bbf7d0",
        },

        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },

        // Warning text colors for dark theme
        "warning-text": {
          200: "#fef3c7",
        },

        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },

        // Error text colors for dark theme
        "error-text": {
          200: "#fecaca",
        },

        // Primary text colors for dark theme
        "primary-text": {
          200: "#dbeafe",
        },

        // Light Theme Neutral Colors
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },

        // Dark Theme Neutral Colors
        dark: {
          50: "#0a0a0a",
          100: "#171717",
          200: "#262626",
          300: "#404040",
          400: "#525252",
          500: "#737373",
          600: "#a3a3a3",
          700: "#d4d4d4",
          800: "#e5e5e5",
          900: "#f5f5f5",
          950: "#fafafa",
        },

        // Light Theme Colors
        background: "#ffffff",
        surface: "#fafafa",
        card: "#ffffff",

        // Dark Theme Colors
        "dark-background": "#0a0a0a",
        "dark-surface": "#171717",
        "dark-card": "#262626",

        // Text Colors
        text: {
          primary: "#171717",
          secondary: "#525252",
          tertiary: "#737373",
          inverse: "#ffffff",
        },

        // Dark Theme Text Colors
        "dark-text": {
          primary: "#f5f5f5",
          secondary: "#d4d4d4",
          tertiary: "#a3a3a3",
          inverse: "#0a0a0a",
        },

        // Border Colors
        border: {
          primary: "#e5e5e5",
          secondary: "#d4d4d4",
          focus: "#2563EB",
        },

        // Dark Theme Border Colors
        "dark-border": {
          primary: "#404040",
          secondary: "#525252",
          focus: "#60a5fa",
        },

        // Accent Colors for specific use cases
        accent: {
          blue: "#3b82f6",
          green: "#22c55e",
          purple: "#8b5cf6",
          orange: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px 0 rgba(0, 0, 0, 0.06)",
        medium: "0 4px 16px 0 rgba(0, 0, 0, 0.08)",
        large: "0 8px 24px 0 rgba(0, 0, 0, 0.1)",
      },
      // Dark theme shadows
      "dark-shadow": {
        soft: "0 2px 8px 0 rgba(255, 255, 255, 0.05)",
        medium: "0 4px 16px 0 rgba(255, 255, 255, 0.08)",
        large: "0 8px 24px 0 rgba(255, 255, 255, 0.1)",
      },
      ringColor: {
        primary: "#2563EB",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
      },
    },
  },
  plugins: [],
};
