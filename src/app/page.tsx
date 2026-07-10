import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

// Depende da sessão (cookies) em produção → renderiza por requisição.
export const dynamic = "force-dynamic";

// Raiz pública: landing quando deslogado (inclui preview); Home quando logado.
export default async function Root() {
  if (isSupabaseConfigured) {
    const user = await getUser();
    if (user) redirect("/home");
  }
  return <Landing />;
}

const BLOCOS = [
  { title: "Organize sua vida financeira", desc: "Receitas, despesas e faturas em um só lugar, com calma e clareza." },
  { title: "Entenda seus vazamentos", desc: "Juros, IOF e assinaturas esquecidas que corroem a sua sobra." },
  { title: "Construa patrimônio com método", desc: "Do controle do caixa à reserva e aos aportes — pensando em décadas." },
];

const CONFIANCA = ["Dados privados", "Sem acesso ao banco", "Análises com evidências"];

function Landing() {
  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        {/* Assinatura visual discreta */}
        <div className="pt-8 flex items-center justify-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl2 text-white text-xs font-semibold"
            style={{ background: "#F39A60" }}>AP</span>
          <span className="text-sm text-txt2 tracking-wide">Arquiteto de Patrimônio</span>
        </div>

        {/* Primeira dobra */}
        <section className="pt-16 pb-16 text-center">
          <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] text-txt">
            Transforme renda em patrimônio, sem improviso.
          </h1>
          <p className="mt-5 text-lg text-txt3 max-w-xl mx-auto leading-relaxed">
            Seu agente financeiro pessoal para organizar o caixa, eliminar vazamentos
            e construir patrimônio com método.
          </p>

          {/* Card de CTA central */}
          <div className="card p-6 mt-10 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="btn-gold flex-1 text-center">Entrar</Link>
              <Link href="#plataforma" className="btn-ghost flex-1 text-center">Conhecer a plataforma</Link>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 text-txt2 text-xs">
              {CONFIANCA.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-sage inline-block" />{c}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 3 blocos de valor (compactos no desktop, empilhados no mobile) */}
        <section id="plataforma" className="pb-28">
          <div className="grid gap-4 sm:grid-cols-3">
            {BLOCOS.map((b) => (
              <div key={b.title} className="card p-5">
                <div className="font-semibold text-[0.95rem] text-txt">{b.title}</div>
                <div className="text-txt2 text-[0.82rem] mt-1.5 leading-relaxed">{b.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
