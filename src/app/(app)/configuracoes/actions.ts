"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export type SaveStatus = "idle" | "ok" | "error" | "preview" | "unauth";
export type SaveState = { status: SaveStatus; message: string };

function numOrNull(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function textOrNull(v: FormDataEntryValue | null): string | null {
  const s = (v == null ? "" : String(v)).trim();
  return s === "" ? null : s;
}

// Salva perfil + preferências do usuário autenticado. Cria o registro de
// settings automaticamente no primeiro salvamento (upsert).
export async function saveConfig(_prev: SaveState, formData: FormData): Promise<SaveState> {
  // Modo preview (desenvolvimento sem Supabase): não grava nada.
  if (!isSupabaseConfigured) {
    return { status: "preview", message: "Modo preview: alterações não são salvas no banco." };
  }
  const supabase = createClient();
  if (!supabase) {
    return { status: "preview", message: "Modo preview: alterações não são salvas no banco." };
  }
  const user = await getUser();
  if (!user) {
    return { status: "unauth", message: "Sessão expirada. Faça login novamente para salvar." };
  }

  const nowIso = new Date().toISOString();

  const { error: profileError } = await supabase.from("users_profile").upsert(
    {
      id: user.id, // vínculo explícito ao usuário logado (RLS exige auth.uid() = id)
      full_name: textOrNull(formData.get("full_name")),
      monthly_income: numOrNull(formData.get("monthly_income")),
      cost_of_living: numOrNull(formData.get("cost_of_living")),
      current_reserve: numOrNull(formData.get("current_reserve")),
      reserve_target: numOrNull(formData.get("reserve_target")),
      risk_profile: textOrNull(formData.get("risk_profile")), // enum ou null (CHECK no schema)
      main_goal: textOrNull(formData.get("main_goal")),
      notes: textOrNull(formData.get("notes")),
      updated_at: nowIso,
    },
    { onConflict: "id" }
  );
  if (profileError) {
    // Não logamos dados do usuário — apenas a mensagem técnica do erro.
    console.error("saveConfig/users_profile:", profileError.message);
    return { status: "error", message: "Não foi possível salvar o perfil. Tente novamente." };
  }

  const { error: settingsError } = await supabase.from("settings").upsert(
    {
      user_id: user.id,
      agent_tone: textOrNull(formData.get("agent_tone")) ?? "firme_humano",
      updated_at: nowIso,
    },
    { onConflict: "user_id" }
  );
  if (settingsError) {
    console.error("saveConfig/settings:", settingsError.message);
    return { status: "error", message: "Perfil salvo, mas falhou ao salvar as preferências." };
  }

  revalidatePath("/configuracoes");
  return { status: "ok", message: "Configurações salvas com sucesso." };
}
