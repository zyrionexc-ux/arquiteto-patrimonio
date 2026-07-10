import Link from "next/link";
import { Badge } from "@/components/ui";

// Rotina do mês (parte mock/preview enquanto o upload/parser não existem).
const ROTINA: { label: string; status: "concluido" | "pendente" | "embreve" }[] = [
  { label: "Configurações preenchidas", status: "pendente" },
  { label: "Metas cadastradas", status: "pendente" },
  { label: "Extrato bancário enviado", status: "embreve" },
  { label: "Fatura do cartão enviada", status: "embreve" },
  { label: "Extrato em aberto enviado", status: "embreve" },
  { label: "Diagnóstico revisado", status: "pendente" },
  { label: "Próxima ação definida", status: "concluido" },
];
const ROTINA_BADGE: Record<string, { text: string; kind: string }> = {
  concluido: { text: "Concluído", kind: "green" },
  pendente: { text: "Pendente", kind: "gold" },
  embreve: { text: "Em breve", kind: "blue" },
};

const PRINCIPAIS = [
  { href: "/dashboard", title: "Diagnóstico financeiro", desc: "Saúde do caixa, score, alertas e plano." },
  { href: "/documentos", title: "Importar arquivos", desc: "Extratos e faturas para o agente cruzar." },
  { href: "/chat", title: "Conversar com o agente", desc: "Tire dúvidas sobre suas finanças." },
  { href: "/configuracoes", title: "Configurações", desc: "Renda, custo de vida, reserva e tom." },
];

const OUTRAS = [
  { href: "/metas", title: "Metas", desc: "Objetivos e progresso." },
  { href: "/financas", title: "Receitas e despesas", desc: "Entradas e saídas, fixas e variáveis." },
];

const CONFIANCA = [
  "Dados privados",
  "Sem acesso ao banco",
  "Análises com evidências",
  "Você controla os documentos enviados",
];

function ActionCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="card card-hover p-6 flex flex-col justify-between min-h-[132px]">
      <div>
        <div className="font-semibold text-txt">{title}</div>
        <div className="text-txt2 text-sm mt-1.5 leading-snug">{desc}</div>
      </div>
      <span className="text-gold text-sm font-medium mt-4">Abrir</span>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="pb-1">
        <h1 className="text-3xl font-semibold tracking-tight text-txt">Bem-vindo de volta.</h1>
        <p className="text-txt2 mt-2 leading-relaxed max-w-xl">
          Um passo de cada vez. Escolha por onde começar hoje.
        </p>
      </div>

      <div className="mt-8 mb-3"><h2 className="sec-title">O que você quer fazer agora?</h2></div>
      <div className="grid gap-5 sm:grid-cols-2">
        {PRINCIPAIS.map((a) => <ActionCard key={a.href} {...a} />)}
      </div>

      <div className="mt-9 mb-3"><h2 className="sec-title">Outras ações</h2></div>
      <div className="grid gap-5 sm:grid-cols-2">
        {OUTRAS.map((a) => <ActionCard key={a.href} {...a} />)}
      </div>

      <div className="mt-10 mb-3">
        <h2 className="sec-title">Sua rotina deste mês</h2>
        <p className="sec-sub mt-1">Um passo de cada vez — o progresso vai aparecer aqui.</p>
      </div>
      <div className="card p-2 sm:p-3">
        <ul>
          {ROTINA.map((r, i) => {
            const b = ROTINA_BADGE[r.status];
            return (
              <li key={r.label}
                className={`flex items-center justify-between gap-3 px-3 py-3 ${i > 0 ? "border-t" : ""}`}
                style={i > 0 ? { borderColor: "rgba(23,26,31,0.06)" } : undefined}>
                <span className={`text-sm ${r.status === "concluido" ? "text-txt" : "text-txt3"}`}>{r.label}</span>
                <Badge text={b.text} kind={b.kind} />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-txt2 text-xs">
        {CONFIANCA.map((c) => (
          <span key={c} className="inline-flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-sage inline-block" />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
