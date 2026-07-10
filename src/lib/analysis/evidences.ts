// Camada de explicabilidade das análises.
//
// IMPORTANTE: os dados abaixo são SEED/EXEMPLO (espelham a análise já validada
// do Bradesco). Ainda não vêm do banco. Quando o parser real existir, cada
// evidência poderá apontar para document_id / transaction_id / bill_id
// (campos já previstos no tipo).

export type EvidenceStatus = "urgente" | "atencao" | "revisar" | "monitorar" | "ok";

export type EvidenceType =
  | "vazamento" | "score" | "alerta" | "fatura"
  | "assinatura" | "duplicidade" | "parcela" | "revisar";

export interface AnalysisEvidence {
  id: string;
  title: string;
  type: EvidenceType;
  amount?: number;
  source: string;              // "De onde veio" (ex.: Fatura do cartão)
  documentLabel?: string;      // rótulo humano do documento de origem
  rule: string;                // "Como o agente identificou"
  explanation: string;         // por que importa (linguagem simples)
  recommendedAction: string;   // "O que fazer agora"
  status: EvidenceStatus;
  // Ligações futuras (parser real) — hoje ficam vazias:
  documentId?: string;
  transactionId?: string;
  billId?: string;
}

export interface AnalysisBreakdown {
  id: string;
  title: string;
  summary: string;
  total?: number;              // número consolidado (contagem ou valor)
  totalLabel?: string;         // como formatar/rotular o total no card
  status: EvidenceStatus;
  seed?: boolean;              // true = exemplo/seed, ainda não é dado real
  evidences: AnalysisEvidence[];
}

const badge = (s: EvidenceStatus) =>
  ({ urgente: "red", atencao: "gold", revisar: "muted", monitorar: "blue", ok: "green" }[s]);
export const statusBadgeKind = badge;

// ---------------------------------------------------------------------------
// 1. Vazamentos detectados
// ---------------------------------------------------------------------------
export const vazamentos: AnalysisBreakdown = {
  id: "vazamentos",
  title: "Vazamentos detectados",
  summary: "Dinheiro que escapa sem virar valor — itens que merecem revisão.",
  total: 6,
  totalLabel: "count",
  status: "atencao",
  seed: true,
  evidences: [
    {
      id: "vaz-selfit", title: "Selfit cobrado em duplicidade", type: "duplicidade",
      amount: 259.8, source: "Fatura do cartão", documentLabel: "Fatura cartão · jun/2026",
      rule: "Duas cobranças iguais (R$ 129,90) no mesmo dia, mesmo estabelecimento.",
      explanation: "Pode ser dois planos ativos ou uma cobrança repetida — R$ 259,80/mês.",
      recommendedAction: "Confirmar no app da academia se há duas matrículas.",
      status: "revisar",
    },
    {
      id: "vaz-iof", title: "IOF e encargos recorrentes", type: "vazamento",
      amount: 164.71, source: "Extrato bancário + Fatura do cartão",
      documentLabel: "Conta corrente + cartão (7 meses)",
      rule: "Soma de IOF e encargos de limite/rotativo ao longo do período.",
      explanation: "Indica caixa no zero antes do salário e pagamentos no limite.",
      recommendedAction: "Formar uma folga para o débito do dia 05 não depender do salário na hora.",
      status: "atencao",
    },
    {
      id: "vaz-claude", title: "Assinatura nova — Anthropic/Claude", type: "assinatura",
      amount: 110, source: "Fatura do cartão", documentLabel: "Cartão final 1804",
      rule: "Primeira cobrança recente, em US$ (gera IOF internacional).",
      explanation: "Assinatura recente é fácil de reavaliar antes de virar hábito.",
      recommendedAction: "Confirmar se usa; cortar libera sobra imediata.",
      status: "monitorar",
    },
    {
      id: "vaz-spotify", title: "Assinatura — Spotify", type: "assinatura",
      amount: 23.9, source: "Fatura do cartão", documentLabel: "Cartão final 2707",
      rule: "Cobrança mensal recorrente identificada.",
      explanation: "Custo fixo pequeno, mas some com as outras assinaturas.",
      recommendedAction: "Manter se usa; avaliar plano combinado/família.",
      status: "monitorar",
    },
    {
      id: "vaz-telefoneria", title: "Parcela longa — Telefoneria 12x", type: "parcela",
      amount: 180, source: "Fatura do cartão", documentLabel: "Parcelamento 12x (R$ 180/mês)",
      rule: "Compra parcelada em 12x compromete várias faturas à frente.",
      explanation: "Parcelas longas engessam o orçamento dos próximos meses.",
      recommendedAction: "Evitar novos parcelamentos até reduzir os atuais.",
      status: "monitorar",
    },
    {
      id: "vaz-revisar", title: "Itens sem categoria clara (Revisar)", type: "revisar",
      source: "Regra do agente", documentLabel: "Classificação automática",
      rule: "Estabelecimentos que não casaram com nenhuma regra de categoria.",
      explanation: "Ficam em 'Revisar' para não distorcer os totais por categoria.",
      recommendedAction: "Revisar e classificar manualmente quando abrir a lista.",
      status: "revisar",
    },
  ],
};

// ---------------------------------------------------------------------------
// 2. Score de Construção Patrimonial
// ---------------------------------------------------------------------------
const scoreCriterio = (
  id: string, title: string, peso: number, ganho: number, ok: EvidenceStatus, explanation: string,
): AnalysisEvidence => ({
  id, title, type: "score", amount: ganho, source: "Regra do agente",
  documentLabel: "Cálculo do score (mês de referência)",
  rule: `Peso ${peso} · resultado: ${ganho === peso ? "atende" : ganho === 0 ? "não atende" : "parcial"} · +${ganho} pontos`,
  explanation, recommendedAction:
    ganho === peso ? "Manter o hábito." : "Melhorar este ponto sobe o score.",
  status: ok,
});

export const score: AnalysisBreakdown = {
  id: "score",
  title: "Score de Construção Patrimonial",
  summary: "Como o agente chegou ao score deste mês (0–100).",
  total: 45,
  totalLabel: "score",
  status: "atencao",
  seed: true,
  evidences: [
    scoreCriterio("sc-sobra", "Sobra positiva no mês", 20, 20, "ok", "Sobrou dinheiro depois das despesas."),
    scoreCriterio("sc-peso", "Fatura abaixo de 50% da receita", 20, 10, "atencao", "A fatura ficou em ~68% da renda (faixa 50–80%)."),
    scoreCriterio("sc-iof", "Ausência de IOF/encargos no cartão", 15, 0, "revisar", "Houve encargos no cartão no mês."),
    scoreCriterio("sc-limite", "Ausência de uso de limite na conta", 15, 0, "revisar", "A conta usou o limite/cheque especial."),
    scoreCriterio("sc-dup", "Duplicidades controladas", 10, 5, "atencao", "2 possíveis duplicidades encontradas."),
    scoreCriterio("sc-assin", "Assinaturas sob controle", 10, 5, "atencao", "Várias assinaturas — vale revisar."),
    scoreCriterio("sc-parc", "Parcelas futuras controladas", 10, 5, "atencao", "Parcelas futuras em ~38% da renda."),
  ],
};

// ---------------------------------------------------------------------------
// 3. Fatura em aberto
// ---------------------------------------------------------------------------
export const faturaAberta: AnalysisBreakdown = {
  id: "fatura-aberta",
  title: "Fatura em aberto",
  summary: "O total exibido inclui um saldo anterior que NÃO é gasto novo.",
  total: 2488.32,
  totalLabel: "brl",
  status: "monitorar",
  seed: true,
  evidences: [
    {
      id: "fat-total", title: "Total exibido no extrato", type: "fatura",
      amount: 9389.04, source: "Extrato do cartão em aberto",
      documentLabel: "extrato_cartao_mes_corrente",
      rule: "Valor bruto que aparece no topo do extrato em aberto.",
      explanation: "Esse número assusta, mas mistura fatura anterior + compras novas.",
      recommendedAction: "Não usar este número como gasto do mês.",
      status: "monitorar",
    },
    {
      id: "fat-saldo", title: "Saldo anterior temporário", type: "fatura",
      amount: 6900.72, source: "Regra do agente",
      documentLabel: "Fatura anterior ainda não compensada",
      rule: "Saldo anterior aparece enquanto a fatura anterior não é quitada/compensada.",
      explanation: "É a fatura anterior 'pendurada' — não é consumo novo de julho.",
      recommendedAction: "Confirmar o pagamento da fatura anterior; ele 'desincha' o total.",
      status: "atencao",
    },
    {
      id: "fat-novo", title: "Consumo novo real (julho)", type: "fatura",
      amount: 2488.32, source: "Extrato do cartão em aberto",
      documentLabel: "extrato_cartao_mes_corrente",
      rule: "Total exibido − saldo anterior = R$ 9.389,04 − R$ 6.900,72.",
      explanation: "Este é o gasto de fato do mês, que vai para a fatura de agosto.",
      recommendedAction: "Acompanhar este valor até o fechamento (~24/07).",
      status: "ok",
    },
  ],
};

// ---------------------------------------------------------------------------
// 4. Alertas
// ---------------------------------------------------------------------------
export const alertasBreakdown: AnalysisBreakdown = {
  id: "alertas",
  title: "Alertas do mês",
  summary: "O que merece sua atenção agora, com valor, origem e ação.",
  total: 4,
  totalLabel: "count",
  status: "urgente",
  seed: true,
  evidences: [
    {
      id: "al-fatura", title: "Fatura vencendo com saldo insuficiente", type: "alerta",
      amount: 1419.39, source: "Fatura do cartão + Extrato bancário",
      documentLabel: "Fatura venc. 05/07 + conta corrente",
      rule: "Fatura R$ 6.900,72 > saldo identificado R$ 5.481,33 (diferença R$ 1.419,39).",
      explanation: "Se não for quitada, o que faltar pode cair no rotativo (14,99% a.m.).",
      recommendedAction: "Conferir no app se a fatura foi debitada ou se entrou dinheiro depois do extrato.",
      status: "urgente",
    },
    {
      id: "al-hapvida", title: "Hapvida cobrada por múltiplos canais", type: "alerta",
      amount: 355, source: "Fatura do cartão + Extrato bancário",
      documentLabel: "Cartão + conta corrente",
      rule: "Mesmo plano aparece em canais diferentes (cartão e conta).",
      explanation: "Pagar o mesmo plano por dois canais pode gerar duplicidade.",
      recommendedAction: "Confirmar se é um único plano e centralizar o pagamento.",
      status: "atencao",
    },
    {
      id: "al-saldo", title: "Saldo anterior temporário na fatura em aberto", type: "alerta",
      amount: 6900.72, source: "Regra do agente", documentLabel: "extrato_cartao_mes_corrente",
      rule: "Saldo anterior infla o total e não é gasto novo.",
      explanation: "Ler R$ 2.488,32 como base real da fatura de agosto.",
      recommendedAction: "Ignorar o saldo anterior ao medir o consumo do mês.",
      status: "monitorar",
    },
    {
      id: "al-selfit", title: "Cobrança repetida — Selfit", type: "alerta",
      amount: 259.8, source: "Fatura do cartão", documentLabel: "Cartão final 2707",
      rule: "2× R$ 129,90 no mesmo dia.",
      explanation: "Pode ser duplicidade ou dois planos ativos.",
      recommendedAction: "Confirmar no app da academia.",
      status: "revisar",
    },
  ],
};

export const BREAKDOWNS: Record<string, AnalysisBreakdown> = {
  vazamentos, score, faturaAberta, alertas: alertasBreakdown,
};
