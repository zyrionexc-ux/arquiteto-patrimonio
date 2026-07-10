"use client";

import { useState } from "react";
import { Badge, fmtBRL } from "@/components/ui";
import EvidenceDrawer from "@/components/EvidenceDrawer";
import type { AnalysisBreakdown } from "@/lib/analysis/evidences";
import { statusBadgeKind } from "@/lib/analysis/evidences";

const STATUS_LABEL: Record<string, string> = {
  urgente: "Urgente", atencao: "Atenção", revisar: "Revisar",
  monitorar: "Monitorar", ok: "OK",
};

function formatTotal(b: AnalysisBreakdown): string {
  if (b.total === undefined) return "—";
  if (b.totalLabel === "brl") return fmtBRL(b.total);
  if (b.totalLabel === "score") return `${b.total}/100`;
  return String(b.total);
}

export default function AnalysisCard({
  breakdown, subtitle,
}: {
  breakdown: AnalysisBreakdown;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="card card-hover p-4 sm:p-5 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="text-txt2 text-[0.7rem] uppercase tracking-wider">{breakdown.title}</div>
          <Badge text={STATUS_LABEL[breakdown.status] ?? breakdown.status} kind={statusBadgeKind(breakdown.status)} />
        </div>
        <div className="text-2xl font-semibold mt-2 leading-none tabular-nums tracking-tight text-txt">{formatTotal(breakdown)}</div>
        <div className="text-txt2 text-[0.8rem] mt-1.5 leading-snug flex-1">{subtitle ?? breakdown.summary}</div>
        <button onClick={() => setOpen(true)}
          className="btn-ghost text-[0.8rem] py-2 mt-3.5 self-start">Ver detalhes</button>
      </div>

      <EvidenceDrawer open={open} breakdown={breakdown} onClose={() => setOpen(false)} />
    </>
  );
}
