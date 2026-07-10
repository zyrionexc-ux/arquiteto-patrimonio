import { ReactNode } from "react";

// Badges consultivos e discretos — cor apenas no badge, nunca no card.
// kinds mapeiam status: red=Urgente, gold=Atenção, blue=Monitorar,
// muted=Revisar, green=OK/Oportunidade.
const BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  red: { bg: "#FEF3C7", color: "#B45309" },
  gold: { bg: "#FEF9C3", color: "#A16207" },
  blue: { bg: "#E0F2FE", color: "#0369A1" },
  muted: { bg: "#F1F5F9", color: "#475569" },
  green: { bg: "#D1FAE5", color: "#047857" },
};

// Acento discreto p/ progresso (barra do score). Sem uso em bordas.
const ACCENT: Record<string, string> = {
  green: "#4B9E86", gold: "#F39A60", red: "#F39A60", blue: "#5E97B8", muted: "#AFC8BE",
};

export function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function Section({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mt-10 mb-4">
      <h2 className="sec-title">{title}</h2>
      {sub && <p className="sec-sub mt-1">{sub}</p>}
    </div>
  );
}

export function Badge({ text, kind = "muted" }: { text: string; kind?: string }) {
  const s = BADGE_STYLE[kind] ?? BADGE_STYLE.muted;
  return <span className="badge" style={{ background: s.bg, color: s.color }}>{text}</span>;
}

export function Kpi({ label, value, sub }:
  { label: string; value: ReactNode; sub?: string; accent?: string }) {
  return (
    <div className="card p-4 sm:p-5 flex flex-col">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value break-words">{value}</div>
      {sub && <div className="text-txt2 text-[0.8rem] mt-1.5 leading-snug">{sub}</div>}
    </div>
  );
}

export function Grid({ children, min = "230px" }: { children: ReactNode; min?: string }) {
  return (
    <div className="grid gap-5"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${min}, 1fr))` }}>
      {children}
    </div>
  );
}

export function Nota({ diagnostico, pesou, acao }:
  { diagnostico: string; pesou: string; acao: string }) {
  return (
    <div className="card p-5 sm:p-7">
      <div className="text-gold text-[0.7rem] uppercase tracking-widest mb-3">Nota do Arquiteto</div>
      <div className="space-y-3.5">
        <NotaBloco label="Diagnóstico" text={diagnostico} />
        <NotaBloco label="O que pesou" text={pesou} />
        <NotaBloco label="Próxima ação" text={acao} accent />
      </div>
    </div>
  );
}

function NotaBloco({ label, text, accent }: { label: string; text: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-txt2 text-xs mb-0.5">{label}</div>
      <p className={`leading-relaxed ${accent ? "text-txt font-medium" : "text-txt3"}`}>{text}</p>
    </div>
  );
}

export function Score({ score, classe, cor, criterios }:
  { score: number; classe: string; cor: string; criterios: [string, string][] }) {
  const markCor: Record<string, string> = { ok: "text-patrimonio", mid: "text-gold", no: "text-txt2" };
  return (
    <div className="card p-7 h-full">
      <div className="flex items-center justify-between">
        <div className="kpi-label mb-0">Score de construção patrimonial</div>
        <Badge text={classe} kind={cor} />
      </div>
      <div className="text-5xl font-bold text-txt mt-3">{score}<span className="text-txt2 text-2xl font-normal"> / 100</span></div>
      <div className="h-1.5 rounded-full bg-txt/8 my-4 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: ACCENT[cor] }} />
      </div>
      <ul className="space-y-1.5 text-sm">
        {criterios.map(([txt, nv], i) => (
          <li key={i} className="text-txt3">
            <span className={markCor[nv]}>· </span>{txt}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AlertCard({ level, title, value, why, action }:
  { level: string; title: string; value: string; why: string; action: string }) {
  const cor: Record<string, string> = {
    "Urgente": "red", "Atenção": "gold", "Revisar": "muted",
    "Oportunidade": "green", "Monitorar": "blue",
  };
  const k = cor[level] ?? "muted";
  return (
    <div className="card p-5 my-3">
      <div className="flex items-start justify-between gap-3">
        <span className="font-semibold text-txt leading-snug">{title}</span>
        <Badge text={level} kind={k} />
      </div>
      <div className="text-txt2 text-sm mt-2 tabular-nums">{value}</div>
      <div className="text-sm mt-2 text-txt3"><span className="text-txt2">Por que importa: </span>{why}</div>
      <div className="text-sm mt-1 text-txt3"><span className="text-txt2">O que fazer agora: </span>{action}</div>
    </div>
  );
}

export function Leak({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="surface p-4">
      <div className="text-txt2 text-xs uppercase tracking-wide">{title}</div>
      <div className="text-xl font-semibold my-1 text-txt">{value}</div>
      <div className="text-txt2 text-xs leading-snug">{detail}</div>
    </div>
  );
}
