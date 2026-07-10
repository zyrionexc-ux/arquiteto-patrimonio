// Leitura central das variáveis de ambiente + guarda de configuração.
// Permite a app rodar em "modo preview" (telas mockadas) mesmo antes de
// conectar o Supabase — útil para desenvolver o visual sem backend.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

// Em produção NUNCA liberamos rotas protegidas sem Supabase (falha fechada).
// O modo preview/mock só é permitido em desenvolvimento local.
export const IS_PROD = process.env.NODE_ENV === "production";
export const isPreviewAllowed = !IS_PROD && !isSupabaseConfigured;
export const MISSING_ENV_MESSAGE =
  "Configuração ausente: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY " +
  "para habilitar login e dados. O modo preview só funciona em desenvolvimento.";

export const AGENT_MODEL = process.env.AGENT_MODEL ?? "claude-opus-4-8";
export const isAgentConfigured = (process.env.ANTHROPIC_API_KEY ?? "").length > 0;
