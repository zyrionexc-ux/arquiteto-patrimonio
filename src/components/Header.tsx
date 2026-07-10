"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MobileNav from "@/components/MobileNav";

export default function Header({ email }: { email?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const naHome = pathname === "/home";

  async function sair() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b"
      style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderColor: "rgba(23,26,31,0.06)", boxShadow: "0 1px 8px rgba(35,49,55,0.04)" }}>
      <div className="flex items-center justify-between px-6 h-12">
        <div className="flex items-center gap-1">
          <button onClick={() => router.back()}
            className="link-muted text-sm px-2.5 py-1 rounded-lg hover:bg-card2" aria-label="Voltar">
            Voltar
          </button>
          <Link href="/home"
            className={`text-sm px-2.5 py-1 rounded-lg transition-colors ${naHome ? "text-txt" : "link-muted hover:bg-card2"}`}>
            Home
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs text-txt2 hidden md:block">{email ?? "modo preview"}</span>
          <button onClick={sair} className="hidden md:block link-muted text-sm px-2.5 py-1 rounded-lg hover:bg-card2">Sair</button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
