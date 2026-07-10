import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Fundo e superfícies claras
        bg: "#F7F8F6",
        card: "#FFFFFF",
        card2: "#F1F3F2",
        surface: "#D8DEDB",
        // Texto
        txt: "#171A1F",
        txt3: "#404752",
        txt2: "#6E7682",
        // Acento principal (mantém o nome "gold" por compatibilidade)
        gold: "#F39A60",
        goldHover: "#E98A4B",
        // Acentos calmos
        patrimonio: "#4B9E86", // verde
        confianca: "#5E97B8", // azul
        alerta: "#D9584F", // vermelho
        sage: "#AFC8BE",
        teal: "#9FC7CC",
        // Bordas discretas
        borda: "#D8DEDB",
      },
      borderRadius: { xl2: "14px", xl3: "20px" },
      boxShadow: {
        card: "0 1px 2px rgba(23,26,31,0.04), 0 10px 30px rgba(23,26,31,0.06)",
        soft: "0 6px 22px rgba(23,26,31,0.08)",
      },
      fontFamily: {
        sans: ["-apple-system", "Segoe UI", "Inter", "Roboto", "Helvetica Neue", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
