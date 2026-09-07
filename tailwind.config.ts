import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfd",
          300: "#7cc1fb",
          400: "#36a1f7",
          500: "#0c83eb",
          600: "#0265c8",
          700: "#0350a2",
          800: "#074485",
          900: "#0F2D6B", // Azul Médico Profundo
          950: "#0a1d46",
        },
        medical: {
          teal: "#00A896", // Verde Sanitario / Teal
          emerald: "#028090",
          mint: "#E0F8F5",
          coral: "#F45B69",
          slate: "#0A192F",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Outfit", "Inter", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
