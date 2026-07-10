// Tipos compartilhados (espelham o schema do Supabase).

export type DocumentKind = "fatura" | "extrato_bancario" | "extrato_cartao_aberto";
export type DocumentStatus = "enviado" | "processado" | "precisa_revisar";
export type AlertLevel = "Urgente" | "Atenção" | "Revisar" | "Oportunidade" | "Monitorar";
export type RecurringKind =
  | "receita_fixa" | "receita_variavel" | "despesa_fixa" | "despesa_variavel";

export interface Kpi { label: string; value: string; sub?: string; accent?: string; }
export interface Alert { level: AlertLevel; title: string; value: string; why: string; action: string; }
export interface Doc { id: string; name: string; kind: DocumentKind; month: string; status: DocumentStatus; }
export interface Goal { id: string; title: string; kind: string; target: number; current: number; deadline: string; }
export interface Recurring { id: string; kind: RecurringKind; name: string; amount: number; recurrence: string; active: boolean; }
export interface ChatMsg { role: "user" | "assistant"; content: string; }
