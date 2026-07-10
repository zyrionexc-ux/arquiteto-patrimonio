import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  IS_PROD,
  MISSING_ENV_MESSAGE,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/env";

type CookieList = { name: string; value: string; options: CookieOptions }[];

const PUBLIC_PATHS = ["/login", "/auth"];

// Renova a sessão e protege as rotas do grupo (app).
export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured) {
    // Produção sem Supabase: falha fechada — nunca abre rota sem auth.
    if (IS_PROD) {
      return new NextResponse(MISSING_ENV_MESSAGE, {
        status: 503,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    // Desenvolvimento: modo preview (mock) para ver o visual sem backend.
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieList) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  // Raiz "/" é a landing pública; /login e /auth também. O resto exige sessão.
  const isPublic = path === "/" || PUBLIC_PATHS.some((p) => path.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }
  return response;
}
