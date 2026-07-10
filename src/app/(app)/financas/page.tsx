import { Badge, Section, fmtBRL } from "@/components/ui";
import { recorrentes } from "@/lib/mock";
import type { RecurringKind } from "@/lib/types";

const GRUPOS: { kind: RecurringKind; label: string; cor: string }[] = [
  { kind: "receita_fixa", label: "Receita fixa", cor: "green" },
  { kind: "receita_variavel", label: "Receita variável", cor: "green" },
  { kind: "despesa_fixa", label: "Despesa fixa", cor: "red" },
  { kind: "despesa_variavel", label: "Despesa variável", cor: "gold" },
];

export default function FinancasPage() {
  const total = (k: RecurringKind) =>
    recorrentes.filter((r) => r.kind === k).reduce((s, r) => s + r.amount, 0);
  const receitas = total("receita_fixa") + total("receita_variavel");
  const despesas = total("despesa_fixa") + total("despesa_variavel");

  return (
    <div>
      <Section title="Receitas e Despesas" sub="Cadastre entradas e saídas fixas e variáveis" />

      <div className="grid sm:grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="kpi-label">Receitas / mês</div><div className="kpi-value">{fmtBRL(receitas)}</div>
        </div>
        <div className="card p-5">
          <div className="kpi-label">Despesas / mês</div><div className="kpi-value">{fmtBRL(despesas)}</div>
        </div>
        <div className="card p-5">
          <div className="kpi-label">Sobra estimada</div>
          <div className="kpi-value" style={{ color: receitas - despesas >= 0 ? "#047857" : "#B45309" }}>{fmtBRL(receitas - despesas)}</div>
        </div>
      </div>

      {GRUPOS.map((g) => {
        const itens = recorrentes.filter((r) => r.kind === g.kind);
        return (
          <div key={g.kind}>
            <Section title={g.label} />
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-txt2 border-b border-borda">
                  <tr className="text-left">
                    <th className="p-3">Nome</th><th className="p-3">Valor</th>
                    <th className="p-3">Recorrência</th><th className="p-3">Ativo</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.length === 0 && (
                    <tr><td className="p-3 text-txt2" colSpan={4}>Nada cadastrado ainda.</td></tr>
                  )}
                  {itens.map((r) => (
                    <tr key={r.id} className="border-b border-borda/60">
                      <td className="p-3">{r.name}</td>
                      <td className="p-3 tabular-nums">{fmtBRL(r.amount)}</td>
                      <td className="p-3 text-txt2">{r.recurrence}</td>
                      <td className="p-3">
                        <Badge text={r.active ? "Ativo" : "Inativo"} kind={r.active ? "green" : "muted"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn-ghost text-sm mt-2">Adicionar {g.label.toLowerCase()}</button>
          </div>
        );
      })}
    </div>
  );
}
