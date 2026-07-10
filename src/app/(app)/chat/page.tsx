"use client";

import { useState } from "react";
import { Section } from "@/components/ui";
import type { ChatMsg } from "@/lib/types";

const SUGESTOES = [
  "Como está minha saúde financeira este mês?",
  "Quais vazamentos merecem revisão?",
  "O que devo fazer nos próximos 7 dias?",
];

export default function ChatPage() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [useContext, setUseContext] = useState(true);
  const [loading, setLoading] = useState(false);

  async function enviar(texto: string) {
    if (!texto.trim() || loading) return;
    const novo: ChatMsg[] = [...msgs, { role: "user", content: texto }];
    setMsgs(novo);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texto, useContext, history: msgs }),
      });
      const data = await r.json();
      setMsgs([...novo, { role: "assistant", content: data.reply ?? "…" }]);
    } catch {
      setMsgs([...novo, { role: "assistant", content: "Não consegui responder agora. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  }

  const vazio = msgs.length === 0;

  return (
    <div className="max-w-3xl mx-auto">
      <Section title="Agente" sub="Converse com o Arquiteto sobre suas finanças." />

      {/* Card inicial consultivo */}
      <div className="card p-6">
        <p className="text-txt3 leading-relaxed">
          Posso analisar seu caixa, explicar vazamentos, revisar metas e transformar
          dúvidas em decisões práticas.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {SUGESTOES.map((s) => (
            <button key={s} onClick={() => enviar(s)} className="btn-ghost text-[0.8rem] py-2">{s}</button>
          ))}
        </div>
      </div>

      {/* Conversa */}
      {!vazio && (
        <div className="card p-4 sm:p-5 mt-5 flex flex-col gap-3">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "self-end max-w-[80%]" : "self-start max-w-[85%]"}>
              <div className={`rounded-xl2 px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-gold text-white" : "surface text-txt3"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="self-start text-txt2 text-sm px-2">O Arquiteto está pensando…</div>}
        </div>
      )}

      {/* Entrada */}
      <form onSubmit={(e) => { e.preventDefault(); enviar(input); }} className="mt-5 flex gap-2 items-end">
        <button type="button" title="Voz (em breve)" disabled
          className="btn-ghost text-sm opacity-50 cursor-not-allowed">Voz</button>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          className="input" placeholder="Escreva sua mensagem..." />
        <button type="submit" className="btn-gold">Enviar</button>
      </form>

      {/* Controle elegante de contexto */}
      <div className="flex items-center justify-between gap-3 mt-4">
        <button type="button" role="switch" aria-checked={useContext}
          onClick={() => setUseContext((v) => !v)}
          className="inline-flex items-center gap-2.5 text-sm text-txt3">
          <span className="relative inline-block w-9 h-5 rounded-full transition-colors"
            style={{ background: useContext ? "#F39A60" : "#D8DEDB" }}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${useContext ? "translate-x-4" : ""}`}
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }} />
          </span>
          Usar meus dados financeiros nesta conversa
        </button>
      </div>

      <p className="text-txt2 text-xs mt-3">
        Em modo inicial, as respostas são simuladas até a IA ser conectada. Nunca peça
        senha de banco.
      </p>
    </div>
  );
}
