"use client";

import { useEffect } from "react";
import { Badge, fmtBRL } from "@/components/ui";
import type { AnalysisBreakdown, AnalysisEvidence } from "@/lib/analysis/evidences";
import { statusBadgeKind } from "@/lib/analysis/evidences";

const STATUS_LABEL: Record<string, string> = {
  urgente: "Urgente", atencao: "Atenção", revisar: "Revisar",
  monitorar: "Monitorar", ok: "OK",
};

export function EvidenceItem({ ev }: { ev: AnalysisEvidence }) {
  return (
    <div className="surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold text-[0.95rem] leading-snug text-txt">{ev.title}</div>
        <Badge text={STATUS_LABEL[ev.status] ?? ev.status} kind={statusBadgeKind(ev.status)} />
      </div>

      {ev.amount !== undefined && (
        <div className="mt-2.5">
          <div className="text-txt2 text-xs">Impacto</div>
          <div className="text-lg font-semibold tabular-nums text-txt leading-tight">{fmtBRL(ev.amount)}</div>
        </div>
      )}

      <dl className="mt-3.5 space-y-3 text-sm">
        <Row k="De onde veio" v={ev.documentLabel ? `${ev.source} · ${ev.documentLabel}` : ev.source} />
        <Row k="Por que importa" v={ev.explanation} />
        <Row k="O que fazer agora" v={ev.recommendedAction} accent />
      </dl>
    </div>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div>
      <dt className="text-txt2 text-xs">{k}</dt>
      <dd className={`mt-0.5 leading-relaxed ${accent ? "text-txt font-medium" : "text-txt3"}`}>{v}</dd>
    </div>
  );
}

export default function EvidenceDrawer({
  open, breakdown, onClose,
}: {
  open: boolean;
  breakdown: AnalysisBreakdown;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={breakdown.title}>
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* painel: largura total no mobile, lateral no desktop */}
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[460px] bg-bg overflow-y-auto"
        style={{ borderLeft: "1px solid rgba(23,26,31,0.06)", boxShadow: "-24px 0 60px rgba(35,49,55,0.10)" }}>
        <div className="sticky top-0 border-b px-5 py-4 flex items-start justify-between gap-3"
          style={{ background: "rgba(247,248,246,0.9)", backdropFilter: "blur(12px)", borderColor: "rgba(23,26,31,0.06)" }}>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{breakdown.title}</h2>
              <Badge text={STATUS_LABEL[breakdown.status] ?? breakdown.status}
                kind={statusBadgeKind(breakdown.status)} />
            </div>
            <p className="text-txt2 text-sm mt-0.5">{breakdown.summary}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar"
            className="text-txt2 hover:text-txt text-xl leading-none px-2">×</button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {breakdown.seed && (
            <div className="surface px-3 py-2.5 text-txt2 text-xs leading-relaxed">
              Exemplo baseado nos dados atuais (seed). Ainda não é uma varredura
              completa dos lançamentos — quando o parser existir, cada item apontará
              para <code>document_id</code>, <code>transaction_id</code> e <code>bill_id</code>.
            </div>
          )}

          {breakdown.evidences.map((ev) => (
            <EvidenceItem key={ev.id} ev={ev} />
          ))}
        </div>
      </aside>
    </div>
  );
}
