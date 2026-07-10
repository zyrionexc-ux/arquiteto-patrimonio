"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const supabase = createClient();
    if (!supabase) {
      router.push("/home"); // modo preview (dev sem Supabase)
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) setMsg(error.message);
    else {
      router.push("/home");
      router.refresh();
    }
  }

  async function recuperar() {
    setMsg(null);
    const supabase = createClient();
    if (!supabase || !email) {
      setMsg("Informe seu e-mail para recuperar a senha.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setMsg(error ? error.message : "Enviamos um link de recuperação para seu e-mail.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-sm text-txt2 hover:text-txt transition-colors">
            Arquiteto de Patrimônio
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-3 text-txt">Entrar</h1>
        </div>

        <form onSubmit={entrar} className="card p-8 space-y-5">
          <div>
            <label className="text-sm text-txt3">E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="input mt-1.5" placeholder="voce@email.com" autoComplete="email" />
          </div>
          <div>
            <label className="text-sm text-txt3">Senha</label>
            <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)}
              className="input mt-1.5" placeholder="••••••••" autoComplete="current-password" />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full">
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <button type="button" onClick={recuperar}
            className="w-full text-center text-sm link-muted">
            Esqueci minha senha
          </button>
          {msg && <p className="text-sm text-gold text-center">{msg}</p>}
        </form>

        <p className="text-center mt-6">
          <Link href="/" className="text-sm link-muted">Voltar ao início</Link>
        </p>
      </div>
    </main>
  );
}
