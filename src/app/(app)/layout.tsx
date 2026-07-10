import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { getUser } from "@/lib/supabase/server";
import { IS_PROD, MISSING_ENV_MESSAGE, isSupabaseConfigured } from "@/lib/env";

// Rotas autenticadas são renderizadas por requisição (dependem de sessão/cookies),
// nunca pré-geradas em build. Também evita que o fail-closed dispare no build.
export const dynamic = "force-dynamic";

// Shell autenticado: sidebar + header + área principal.
// Defesa em profundidade: além do middleware, o layout também bloqueia em
// produção sem Supabase (nunca renderiza conteúdo protegido sem auth).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let email: string | undefined;
  if (isSupabaseConfigured) {
    const user = await getUser();
    if (!user) redirect("/login");
    email = user.email ?? undefined;
  } else if (IS_PROD) {
    // Falha fechada: em produção sem env, não há sessão possível.
    throw new Error(MISSING_ENV_MESSAGE);
  }
  // Só chega aqui sem Supabase em desenvolvimento (modo preview).

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header email={email} />
        <main className="flex-1 px-6 py-8 sm:px-10 sm:py-10 max-w-[1200px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
