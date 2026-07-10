import { AlertCard, Badge, Grid, Kpi, Leak, Nota, Score, Section } from "@/components/ui";
import { alerts, diagnostico, kpis, notaArquiteto, plano7 } from "@/lib/mock";
import AnalysisCard from "@/components/AnalysisCard";
import { alertasBreakdown, faturaAberta, score as scoreBreakdown, vazamentos } from "@/lib/analysis/evidences";

const CRIT: [string, string][] = [
  ["Sobra positiva no mês (+20)", "ok"],
  ["Fatura em 68% da renda (+10)", "mid"],
  ["Encargos no cartão (0)", "no"],
  ["Uso de limite/IOF na conta (0)", "no"],
  ["2 possíveis duplicidades (+5)", "mid"],
  ["Assinaturas — revisar (+5)", "mid"],
  ["Parcelas futuras em 38% da renda (+5)", "mid"],
];

export default function DashboardPage() {
  return (
    <div>
      <Nota {...notaArquiteto} />

      {/* Ação mais importante agora — perto do topo, antes dos detalhes longos */}
      <div className="card p-5 sm:p-6 mt-5">
        <div className="flex items-center gap-2">
          <Badge text="Prioridade" kind="gold" />
          <span className="text-txt2 text-[0.7rem] uppercase tracking-wider">Ação mais importante agora</span>
        </div>
        <p className="text-lg font-semibold text-txt mt-2.5 leading-snug">
          Confirmar hoje se a fatura de R$ 6.900,72 foi debitada.
        </p>
        <p className="text-txt2 text-sm mt-1.5 leading-relaxed">
          É o ponto que mais pode gerar juros agora — saldo identificado R$ 5.481,33,
          diferença R$ 1.419,39.
        </p>
      </div>

      <Section title="Análises com evidências"
        sub="Cada número consolidado pode ser aberto: itens, origem, regra aplicada e o que fazer" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalysisCard breakdown={vazamentos} subtitle="6 itens que merecem revisão" />
        <AnalysisCard breakdown={scoreBreakdown} subtitle="Como o score foi calculado" />
        <AnalysisCard breakdown={faturaAberta} subtitle="Consumo real de julho (sem saldo anterior)" />
        <AnalysisCard breakdown={alertasBreakdown} subtitle="Avisos com valor, origem e ação" />
      </div>

      <Section title="Diagnóstico do mês" sub={`Referência: ${diagnostico.mesRef} (último mês fechado)`} />
      <Grid>
        {kpis.map((k) => (
          <Kpi key={k.label} label={k.label}
            value={k.label === "Saúde do caixa" ? <Badge text={k.value} kind="gold" /> : k.value}
            sub={k.sub} accent={k.accent} />
        ))}
      </Grid>

      <div className="mt-5 max-w-xl">
        <Score score={diagnostico.score} classe={diagnostico.scoreClasse} cor="gold" criterios={CRIT} />
      </div>

      <Section title="Plano dos próximos 7 dias" />
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))" }}>
        {[
          { q: "Hoje", kind: "red", itens: plano7.hoje },
          { q: "Próximos 3 dias", kind: "gold", itens: plano7.tres },
          { q: "Até 7 dias", kind: "blue", itens: plano7.sete },
        ].map((c) => (
          <div key={c.q} className="card p-5">
            <Badge text={c.q} kind={c.kind} />
            <ul className="list-disc pl-5 mt-3 space-y-1.5 text-sm">
              {c.itens.map((i, idx) => <li key={idx}>{i}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <Section title="Vazamentos" sub="Dinheiro que escapa sem virar valor" />
      <Grid>
        <Leak title="IOF + encargos" value="R$ 164,71" detail="conta + cartão · 7 meses com limite" />
        <Leak title="Duplicidades" value="2 itens" detail="Selfit 2× e TIM 2× no mesmo dia" />
        <Leak title="Assinaturas novas" value="R$ 133,90/mês" detail="Anthropic/Claude + Spotify" />
        <Leak title="Parcelas longas" value="3 ativas" detail="Telefoneria 12x · Ferreira Costa 10x · Casas Bahia 10x" />
      </Grid>

      <Section title="O que merece sua atenção agora" />
      {alerts.map((a, i) => <AlertCard key={i} {...a} />)}
    </div>
  );
}
