"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/home", label: "Home" },
  { href: "/dashboard", label: "Diagnóstico" },
  { href: "/documentos", label: "Documentos" },
  { href: "/chat", label: "Agente" },
  { href: "/metas", label: "Metas" },
  { href: "/financas", label: "Receitas e despesas" },
  { href: "/configuracoes", label: "Configurações" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();

  async function sair() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="md:hidden link-muted text-sm px-2.5 py-1 rounded-lg hover:bg-card2" aria-label="Abrir menu">
        Menu
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navegação">
          <div className="absolute inset-0 bg-black/25" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-72 max-w-[85%] overflow-y-auto"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
              boxShadow: "-20px 0 50px rgba(35,49,55,0.12)",
              borderLeft: "1px solid rgba(23,26,31,0.06)",
            }}>
            <div className="flex items-center justify-between px-5 h-12 border-b"
              style={{ borderColor: "rgba(23,26,31,0.06)" }}>
              <span className="text-sm font-semibold text-txt">Menu</span>
              <button onClick={() => setOpen(false)}
                className="link-muted text-sm px-2 py-1 rounded-lg hover:bg-card2" aria-label="Fechar">
                Fechar
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {NAV.map((n) => {
                const active = path === n.href || path.startsWith(n.href + "/");
                return (
                  <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                    className={`block px-3 py-2.5 rounded-xl2 text-sm transition-colors ${
                      active ? "bg-card2 text-txt font-medium" : "text-txt2 hover:text-txt hover:bg-card2/70"
                    }`}>
                    {n.label}
                  </Link>
                );
              })}
              <div className="my-2 border-t" style={{ borderColor: "rgba(23,26,31,0.06)" }} />
              <button onClick={sair}
                className="w-full text-left px-3 py-2.5 rounded-xl2 text-sm text-txt2 hover:text-txt hover:bg-card2/70">
                Sair
              </button>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
