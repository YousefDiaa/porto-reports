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
        porto: {
          navy: "#003C71",
          "navy-light": "#00428C",
          "navy-dark": "#002855",
          gold: "#E9B245",
          "gold-dark": "#B57017",
          "gold-light": "#F5CA75",
          white: "#FFFFFF",
          gray: "#F5F7FA",
          "gray-dark": "#E2E8F0",
          text: "#2D3748",
          "text-light": "#718096",
        },
      },
      fontFamily: {
        arabic: ["Cairo", "Tajawal", "sans-serif"],
      },
      backgroundImage: {
        "porto-gradient": "linear-gradient(135deg, #003C71 0%, #00428C 50%, #002855 100%)",
        "gold-gradient": "linear-gradient(135deg, #E9B245 0%, #B57017 100%)",
      },
      boxShadow: {
        "porto": "0 4px 20px rgba(0, 60, 113, 0.15)",
        "porto-lg": "0 8px 40px rgba(0, 60, 113, 0.2)",
        "gold": "0 4px 20px rgba(233, 178, 69, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
