"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { saveConfig, type SaveState } from "./actions";

export type ConfigInitial = {
  full_name?: string | null;
  monthly_income?: number | null;
  cost_of_living?: number | null;
  current_reserve?: number | null;
  reserve_target?: number | null;
  risk_profile?: string | null;
  main_goal?: string | null;
  notes?: string | null;
  agent_tone?: string | null;
};

const initialState: SaveState = { status: "idle", message: "" };

function val(v: number | null | undefined): string | number {
  return v === null || v === undefined ? "" : v;
}

function SubmitButton({ preview }: { preview?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-gold" disabled={pending}>
      {pending ? "Salvando..." : preview ? "Salvar (preview)" : "Salvar"}
    </button>
  );
}

function StatusBanner({ state }: { state: SaveState }) {
  if (state.status === "idle") return null;
  const styles: Record<string, string> = {
    ok: "bg-patrimonio/12 text-patrimonio border-patrimonio/30",
    error: "bg-alerta/12 text-alerta border-alerta/30",
    preview: "bg-gold/12 text-gold border-gold/30",
    unauth: "bg-alerta/12 text-alerta border-alerta/30",
  };
  return (
    <div className={`rounded-xl2 border px-4 py-2.5 text-sm ${styles[state.status] ?? ""}`}>
      {state.message}
      {state.status === "unauth" && (
        <>
          {" "}
          <Link href="/login" className="underline">Ir para o login</Link>
        </>
      )}
    </div>
  );
}

export default function ConfigForm({
  initial,
  preview,
}: {
  initial: ConfigInitial;
  preview?: boolean;
}) {
  const [state, formAction] = useFormState(saveConfig, initialState);

  return (
    <form action={formAction} className="card p-6 sm:p-7 space-y-7 max-w-2xl">
      {preview && (
        <div className="surface px-4 py-2.5 text-txt2 text-sm">
          Modo preview (desenvolvimento sem Supabase): você pode editar, mas nada é salvo no banco.
        </div>
      )}

      <FormSection title="Perfil financeiro">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nome" name="full_name" defaultValue={initial.full_name ?? ""} placeholder="Seu nome" />
          <div>
            <label className="text-sm text-txt3">Perfil de risco</label>
            <select name="risk_profile" defaultValue={initial.risk_profile ?? ""} className="input mt-1.5">
              <option value="">— selecionar —</option>
              <option value="conservador">Conservador</option>
              <option value="moderado">Moderado</option>
              <option value="arrojado">Arrojado</option>
            </select>
          </div>
          <Money label="Renda mensal estimada" name="monthly_income" defaultValue={val(initial.monthly_income)} />
          <Money label="Custo de vida estimado" name="cost_of_living" defaultValue={val(initial.cost_of_living)} />
        </div>
      </FormSection>

      <FormSection title="Reserva e objetivos">
        <div className="grid sm:grid-cols-2 gap-4">
          <Money label="Reserva atual" name="current_reserve" defaultValue={val(initial.current_reserve)} />
          <Money label="Meta de reserva" name="reserve_target" defaultValue={val(initial.reserve_target)} />
          <div className="sm:col-span-2">
            <Field label="Objetivo principal" name="main_goal" defaultValue={initial.main_goal ?? ""}
              placeholder="Ex.: montar reserva de 6 meses" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Preferências do agente">
        <div className="max-w-sm">
          <label className="text-sm text-txt3">Tom do agente</label>
          <select name="agent_tone" defaultValue={initial.agent_tone ?? "firme_humano"} className="input mt-1.5">
            <option value="firme_humano">Firme e humano</option>
            <option value="direto">Direto</option>
            <option value="didatico">Didático</option>
          </select>
        </div>
      </FormSection>

      <FormSection title="Observações">
        <textarea name="notes" defaultValue={initial.notes ?? ""} rows={3} className="input"
          placeholder="Contexto que o agente deve considerar (dívidas, planos, restrições…)" />
      </FormSection>

      <div className="flex items-center gap-3 pt-1">
        <SubmitButton preview={preview} />
        <StatusBanner state={state} />
      </div>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-txt mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, name, defaultValue, placeholder }:
  { label: string; name: string; defaultValue?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm text-txt3">{label}</label>
      <input name={name} defaultValue={defaultValue} className="input mt-1.5" placeholder={placeholder} />
    </div>
  );
}

function Money({ label, name, defaultValue }:
  { label: string; name: string; defaultValue?: string | number }) {
  return (
    <div>
      <label className="text-sm text-txt3">{label} (R$)</label>
      <input type="number" step="0.01" min="0" name={name} defaultValue={defaultValue}
        className="input mt-1.5" placeholder="0,00" />
    </div>
  );
}
