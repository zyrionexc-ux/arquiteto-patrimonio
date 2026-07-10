import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { AGENT_MODEL, isAgentConfigured, isSupabaseConfigured } from "@/lib/env";
import { getUser } from "@/lib/supabase/server";
import type { ChatMsg } from "@/lib/types";

// Persona do agente. O contexto financeiro real do usuário será montado a
// partir das tabelas dele (V2); na V1 usamos um resumo estático quando
// "usar contexto financeiro" está ligado.
const SYSTEM = `Você é o "Arquiteto de Patrimônio", um conselheiro financeiro firme,
humano e prático. Ajuda a pessoa a sair do improviso e construir patrimônio real,
seguindo a lógica: 1) gastar menos do que ganha, 2) eliminar vazamentos invisíveis,
3) criar reserva de segurança, 4) aumentar renda, 5) investir com método, 6) proteger
patrimônio, 7) pensar em décadas. Regras: não dê recomendação específica de investimento,
não prometa ganhos, não use linguagem de coach. Seja direto, sem julgar. Responda em
português do Brasil, curto e claro. Nunca peça senha de banco nem dados sensíveis.`;

const CONTEXTO_RESUMO = `Contexto financeiro do usuário (resumo):
- Saúde do caixa: Atenção. Sobra do mês ~R$ 1.080,70. Fatura consome ~68% da renda.
- Risco imediato: fatura de R$ 6.900,72 vencendo, saldo identificado R$ 5.481,33.
- Vazamentos: encargos/IOF recorrentes, Selfit cobrado 2x, Hapvida por múltiplos canais.
- Consumo novo de julho (fatura de agosto): ~R$ 2.488,32 (sem o saldo anterior temporário).`;

export async function POST(req: NextRequest) {
  const { message, useContext, history } = (await req.json()) as {
    message: string;
    useContext?: boolean;
    history?: ChatMsg[];
  };

  // Se o Supabase estiver ativo, exige usuário autenticado.
  if (isSupabaseConfigured) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  // Sem chave de IA: resposta simulada (modo preview).
  if (!isAgentConfigured) {
    return NextResponse.json({
      reply:
        "Modo preview: a API de IA ainda não está configurada. Assim que a chave " +
        "ANTHROPIC_API_KEY for definida no servidor, eu respondo com base no seu " +
        "contexto financeiro. Sua pergunta foi: “" + message + "”.",
    });
  }

  const client = new Anthropic();
  const system = useContext ? `${SYSTEM}\n\n${CONTEXTO_RESUMO}` : SYSTEM;

  const messages: Anthropic.MessageParam[] = [
    ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: message },
  ];

  try {
    const response = await client.messages.create({
      model: AGENT_MODEL,
      max_tokens: 1024,
      system,
      messages,
    });
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    return NextResponse.json({ reply: text || "…" });
  } catch (err) {
    const msg = err instanceof Anthropic.APIError ? err.message : "erro ao chamar a IA";
    return NextResponse.json({ reply: `Não consegui responder agora (${msg}).` });
  }
}
