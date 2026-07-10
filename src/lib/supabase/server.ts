import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieList = { name: string; value: string; options: CookieOptions }[];
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";

// Cliente para Server Components / route handlers. Lê a sessão dos cookies.
// Retorna null em modo preview (sem Supabase configurado).
export function createClient() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieList) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // chamado de um Server Component: ignorável (middleware renova a sessão)
        }
      },
    },
  });
}

// Retorna o usuário autenticado (ou null). Nunca lança em modo preview.
export async function getUser() {
  const supabase = createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
