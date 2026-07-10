// Dados mockados para a V1 (telas com aparência real antes do backend).
// Espelham a análise já validada do Bradesco. Nada aqui é gravado no banco.
import type { Alert, Doc, Goal, Recurring } from "@/lib/types";

export const diagnostico = {
  mesRef: "Jun/26",
  status: "Atenção",
  statusCor: "gold",
  sobra: 1080.7,
  peso: 68,
  vazamentos: 6,
  comprasNovas: 2488.32,
  score: 45,
  scoreClasse: "Atenção",
};

export const notaArquiteto = {
  diagnostico:
    "Seu caixa está em Atenção. Em Jun/26, a fatura consumiu 68% da sua renda e " +
    "sobraram R$ 1.080,70 no mês.",
  pesou:
    "Pesaram os encargos e IOF recorrentes, o Selfit cobrado duas vezes e a Hapvida " +
    "aparecendo por mais de um canal.",
  acao:
    "Confirme hoje se a fatura de R$ 6.900,72 foi debitada (saldo identificado R$ 5.481,33, " +
    "diferença R$ 1.419,39). É o ponto que mais pode gerar juros agora.",
};

export const kpis = [
  { label: "Saúde do caixa", value: "Atenção", sub: "Fatura consumiu 68% da renda", accent: "gold" },
  { label: "Sobra real", value: "R$ 1.080,70", sub: "Receita − Despesa no mês", accent: "green" },
  { label: "Peso do cartão", value: "68%", sub: "da receita foi para a fatura", accent: "gold" },
  { label: "Vazamentos", value: "6", sub: "alertas relevantes a revisar", accent: "red" },
  { label: "Compras novas (em aberto)", value: "R$ 2.488,32", sub: "consumo real de julho", accent: "blue" },
  { label: "Risco imediato", value: "Fatura vence hoje", sub: "conferir débito e saldo", accent: "red" },
];

export const plano7 = {
  hoje: ["Confirmar se a fatura de R$ 6.900,72 foi debitada e se o saldo cobre (falta ~R$ 1.419,39)."],
  tres: [
    "Revisar cobranças repetidas: Selfit 2× R$ 129,90 e TIM 2× R$ 54,27.",
    "Confirmar se a Hapvida está sendo paga por um único canal.",
  ],
  sete: [
    "Cancelar assinaturas que não usa (Claude, Spotify, Apple).",
    "Acompanhar a fatura de agosto (começa em ~R$ 2.488,32).",
    "Não abrir novos parcelamentos até reduzir os atuais.",
  ],
};

export const alerts: Alert[] = [
  {
    level: "Urgente",
    title: "Fatura vencendo com saldo insuficiente",
    value: "Fatura R$ 6.900,72 | saldo R$ 5.481,33 | diferença R$ 1.419,39",
    why: "Se não for quitada, o valor que faltar pode cair no rotativo (14,99% a.m.).",
    action: "Confirmar no app se a fatura foi debitada ou se entrou dinheiro depois do extrato.",
  },
  {
    level: "Atenção",
    title: "Hapvida cobrada por múltiplos canais",
    value: "Cartão e conta — R$ 330–358/mês",
    why: "Pagar o mesmo plano por canais diferentes pode gerar duplicidade.",
    action: "Confirmar se é um único plano e centralizar o pagamento.",
  },
  {
    level: "Revisar",
    title: "Cobrança repetida — Selfit",
    value: "2x R$ 129,90 no mesmo dia = R$ 259,80",
    why: "Pode ser duplicidade ou mais de um plano ativo.",
    action: "Confirmar no app da academia se há cobrança em duplicidade.",
  },
  {
    level: "Monitorar",
    title: "Fatura em aberto com saldo anterior temporário",
    value: "Extrato R$ 9.389,04 | saldo anterior R$ 6.900,72 | consumo real R$ 2.488,32",
    why: "O saldo anterior infla o total e não é gasto novo de julho.",
    action: "Ler R$ 2.488,32 como base da fatura de agosto.",
  },
  {
    level: "Oportunidade",
    title: "Assinatura nova — Anthropic/Claude",
    value: "R$ 110,00/mês · 1ª cobrança em Ago/26",
    why: "Cobrada em US$ — gera IOF internacional.",
    action: "Confirmar se usa; cortar o que não usa libera sobra imediata.",
  },
];

export const documentos: Doc[] = [
  { id: "1", name: "BradescoCartoes-jun.pdf", kind: "fatura", month: "2026-06", status: "processado" },
  { id: "2", name: "extrato-jun.pdf", kind: "extrato_bancario", month: "2026-06", status: "processado" },
  { id: "3", name: "extratoCartao.pdf", kind: "extrato_cartao_aberto", month: "2026-07", status: "precisa_revisar" },
  { id: "4", name: "BradescoCartoes-jul.pdf", kind: "fatura", month: "2026-07", status: "enviado" },
];

export const metas: Goal[] = [
  { id: "1", title: "Reserva de emergência", kind: "reserva", target: 52703, current: 0, deadline: "2027-06-30" },
  { id: "2", title: "Quitar rotativo / evitar juros", kind: "quitar_divida", target: 0, current: 0, deadline: "2026-08-05" },
];

export const recorrentes: Recurring[] = [
  { id: "1", kind: "receita_fixa", name: "Salário (Município do Recife)", amount: 4489.77, recurrence: "mensal", active: true },
  { id: "2", kind: "receita_variavel", name: "PIX recebidos (apoio/extra)", amount: 1000, recurrence: "mensal", active: true },
  { id: "3", kind: "despesa_fixa", name: "Hapvida (plano de saúde)", amount: 355, recurrence: "mensal", active: true },
  { id: "4", kind: "despesa_fixa", name: "Selfit (academia)", amount: 259.8, recurrence: "mensal", active: true },
  { id: "5", kind: "despesa_variavel", name: "Transporte (Uber/99)", amount: 400, recurrence: "mensal", active: true },
];
