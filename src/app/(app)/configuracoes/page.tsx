import { redirect } from "next/navigation";
import { Section } from "@/components/ui";
import { createClient, getUser } from "@/lib/supabase/server";
import { isPreviewAllowed } from "@/lib/env";
import ConfigForm, { type ConfigInitial } from "./ConfigForm";

// Primeira tela conectada ao Supabase (users_profile + settings).
// Carregamento é server-side: os dados chegam já preenchidos no formulário.
export default async function ConfiguracoesPage() {
  const header = (
    <Section title="Configurações" sub="Dados básicos e preferências do agente — salvos com segurança na sua conta" />
  );

  // Modo preview (só em desenvolvimento sem Supabase): form vazio, não salva.
  if (isPreviewAllowed) {
    return (
      <div className="max-w-2xl">
        {header}
        <ConfigForm initial={{}} preview />
      </div>
    );
  }

  // Configurado: exige autenticação (em produção sem env, o middleware já bloqueou).
  const user = await getUser();
  if (!user) redirect("/login");

  let initial: ConfigInitial = {};
  const supabase = createClient();
  if (supabase) {
    const { data: profile } = await supabase
      .from("users_profile")
      .select("full_name, monthly_income, cost_of_living, current_reserve, reserve_target, risk_profile, main_goal, notes")
      .eq("id", user.id)
      .maybeSingle();
    const { data: settings } = await supabase
      .from("settings")
      .select("agent_tone")
      .eq("user_id", user.id)
      .maybeSingle();
    initial = { ...(profile ?? {}), agent_tone: settings?.agent_tone ?? "firme_humano" };
  }

  return (
    <div className="max-w-2xl">
      {header}
      <ConfigForm initial={initial} />
    </div>
  );
}
