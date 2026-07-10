"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/home", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/documentos", label: "Documentos" },
  { href: "/chat", label: "Agente" },
  { href: "/metas", label: "Metas" },
  { href: "/financas", label: "Receitas e Despesas" },
  { href: "/configuracoes", label: "Configurações" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-64 shrink-0 bg-card border-r border-borda min-h-screen p-5 hidden md:block">
      <Link href="/home" className="block px-2 py-3 mb-5">
        <div className="text-base font-semibold tracking-tight text-txt">Arquiteto de Patrimônio</div>
        <div className="text-txt2 text-xs mt-0.5">seu agente financeiro</div>
      </Link>
      <nav className="space-y-1">
        {NAV.map((n) => {
          const active = path === n.href || path.startsWith(n.href + "/");
          return (
            <Link key={n.href} href={n.href}
              className={`block px-3 py-2 rounded-xl2 text-sm transition-colors
                ${active
                  ? "bg-card2 text-txt font-medium border border-borda"
                  : "text-txt2 hover:text-txt hover:bg-card2/70"}`}>
              {n.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
