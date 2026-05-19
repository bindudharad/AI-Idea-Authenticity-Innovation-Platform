import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./charts/**/*.{ts,tsx}",
    "./ui/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        mist: "#edf3ff",
        line: "rgba(148, 163, 184, 0.18)",
        glow: "#64f1d6",
        coral: "#ff835c",
        solar: "#ffd16a"
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at top left, rgba(100, 241, 214, 0.25), transparent 28%), radial-gradient(circle at top right, rgba(255, 131, 92, 0.18), transparent 32%), linear-gradient(135deg, #08111f 0%, #0f1c31 45%, #102849 100%)",
        "premium-mesh": "radial-gradient(circle at 18% 12%, rgba(34, 211, 238, 0.14), transparent 28%), radial-gradient(circle at 84% 18%, rgba(59, 130, 246, 0.12), transparent 30%), radial-gradient(circle at 54% 88%, rgba(168, 85, 247, 0.10), transparent 32%)"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(8, 17, 31, 0.35)",
        "cyan-glow": "0 0 32px rgba(34, 211, 238, 0.22)"
      },
      keyframes: {
        "gradient-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(-2%, 1.5%, 0) scale(1.04)" }
        },
        "soft-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        }
      },
      animation: {
        "gradient-drift": "gradient-drift 18s ease-in-out infinite",
        "soft-float": "soft-float 5s ease-in-out infinite"
      },
      fontFamily: {
        sans: ["Segoe UI", "Helvetica Neue", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
