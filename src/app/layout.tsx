import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arquiteto de Patrimônio",
  description: "Transforme renda em patrimônio, sem improviso.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg text-txt min-h-screen antialiased">{children}</body>
    </html>
  );
}
