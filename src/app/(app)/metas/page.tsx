import { Badge, Section, fmtBRL } from "@/components/ui";
import { metas } from "@/lib/mock";

export default function MetasPage() {
  return (
    <div>
      <Section title="Metas" sub="Defina objetivos e acompanhe o progresso" />

      <div className="grid md:grid-cols-2 gap-4">
        {metas.map((m) => {
          const pct = m.target > 0 ? Math.min(100, Math.round((m.current / m.target) * 100)) : 0;
          return (
            <div key={m.id} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{m.title}</div>
                <Badge text={m.kind} kind="blue" />
              </div>
              <div className="text-txt2 text-sm mt-1">Prazo: {m.deadline}</div>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-2xl font-bold">{fmtBRL(m.current)}</span>
                <span className="text-txt2 text-sm">de {fmtBRL(m.target)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 mt-3 overflow-hidden">
                <div className="h-full bg-patrimonio rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-txt2 text-xs mt-1">{pct}% concluído</div>
            </div>
          );
        })}

        <button className="card p-5 text-txt2 hover:text-txt hover:shadow-soft
          flex flex-col items-center justify-center min-h-[160px] transition-shadow">
          <span className="text-sm font-medium">Cadastrar nova meta</span>
        </button>
      </div>

      <p className="text-txt2 text-xs mt-4">
        Cadastro persistente (tabela <code>goals</code>) entra assim que o Supabase estiver conectado.
      </p>
    </div>
  );
}
