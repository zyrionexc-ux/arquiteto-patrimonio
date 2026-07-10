import { Badge, Section } from "@/components/ui";
import { documentos } from "@/lib/mock";

const KIND_LABEL: Record<string, string> = {
  fatura: "Fatura do cartão",
  extrato_bancario: "Extrato bancário",
  extrato_cartao_aberto: "Extrato do cartão (aberto)",
};
const STATUS_KIND: Record<string, string> = {
  enviado: "blue", processado: "green", precisa_revisar: "gold",
};
const STATUS_LABEL: Record<string, string> = {
  enviado: "Enviado", processado: "Processado", precisa_revisar: "Precisa revisar",
};

// 3 tipos com descrição clara + status atual do tipo (seed).
const TIPOS = [
  {
    slug: "extrato_bancario", title: "Extrato bancário",
    desc: "Entradas, saídas, saldo, IOF, encargos e pagamento da fatura.",
    status: "Enviado", kind: "blue",
  },
  {
    slug: "fatura_cartao", title: "Fatura do cartão",
    desc: "Compras, parcelas, assinaturas, encargos e vencimento.",
    status: "Processado", kind: "green",
  },
  {
    slug: "extrato_cartao_mes_corrente", title: "Extrato do cartão em aberto",
    desc: "Consumo do mês corrente e previsão da próxima fatura.",
    status: "Pendente", kind: "muted",
  },
];

export default function DocumentosPage() {
  return (
    <div>
      <Section title="Documentos" sub="Envie extratos e faturas para o agente cruzar suas finanças com segurança" />

      <div className="grid md:grid-cols-3 gap-5">
        {TIPOS.map((t) => (
          <div key={t.slug} data-doc-type={t.slug} className="card p-5 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-txt">{t.title}</div>
              <Badge text={t.status} kind={t.kind} />
            </div>
            <div className="text-txt2 text-sm mt-2 leading-snug flex-1">{t.desc}</div>
            <label className="btn-ghost text-sm mt-4 text-center cursor-pointer">
              Selecionar arquivo
              <input type="file" accept="application/pdf" className="hidden" disabled />
            </label>
          </div>
        ))}
      </div>
      <p className="text-txt2 text-xs mt-3">
        Status possíveis: Pendente · Enviado · Processado · Precisa revisar.
      </p>

      <Section title="Arquivos enviados" />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-txt2" style={{ borderBottom: "1px solid rgba(23,26,31,0.06)" }}>
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Arquivo</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Mês</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((d) => (
                <tr key={d.id} style={{ borderTop: "1px solid rgba(23,26,31,0.05)" }}>
                  <td className="px-4 py-3 text-txt">{d.name}</td>
                  <td className="px-4 py-3 text-txt2">{KIND_LABEL[d.kind]}</td>
                  <td className="px-4 py-3 text-txt2">{d.month}</td>
                  <td className="px-4 py-3"><Badge text={STATUS_LABEL[d.status]} kind={STATUS_KIND[d.status]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-txt2 text-xs mt-3">
        Exemplo de arquivos. O upload real será conectado na próxima etapa — nada foi
        processado de verdade ainda.
      </p>
    </div>
  );
}
