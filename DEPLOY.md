# Deploy gratuito — Arquiteto de Patrimônio (webapp)

Publicar o webapp Next.js na **Vercel** (free), com **Supabase** (Auth + Database +
Storage) e **GitHub** para versionamento. Passo a passo do zero.

> O `dashboard/` (Streamlit) e os PDFs em `docs/` **não** vão para a Vercel — o deploy
> usa apenas a pasta `webapp/` (Root Directory abaixo).

---

## Pré-requisitos
- Conta no GitHub, na Vercel e no Supabase (todas free).
- O repositório com este projeto no GitHub (a raiz do repo contém `dashboard/`,
  `docs/` e `webapp/`).

---

## A. Criar projeto no Supabase
1. Acesse supabase.com → **New project**.
2. Defina nome, senha do banco (guarde) e região próxima (ex.: São Paulo).
3. Aguarde o provisionamento (~1–2 min).

## B. Rodar o schema (duas vezes — teste de idempotência)
1. No projeto: **SQL Editor → New query**.
2. Cole **todo** o conteúdo de `webapp/supabase/schema.sql` e clique **Run**.
3. **Rode o mesmo script uma segunda vez.** Deve executar **sem erro**
   (`drop policy if exists` + `add column if not exists` garantem idempotência).
   Se a 2ª execução falhar, pare e revise antes de seguir.

Isso cria: tabelas, **RLS** (isolamento por `user_id`), trigger que cria
`users_profile` + `settings` no cadastro, e o **bucket privado `documents`**.

## C. Configurar Authentication (e-mail/senha)
1. **Authentication → Providers → Email**: habilitar.
2. Para testar rápido: **desligue "Confirm email"** (senão o login exige confirmação).
3. **Authentication → URL Configuration**:
   - **Site URL**: a URL de produção da Vercel (ex.: `https://seu-app.vercel.app`).
   - **Redirect URLs**: adicione `https://seu-app.vercel.app/**`.
   (Pode voltar aqui depois de ter a URL da Vercel.)

## D. Copiar Project URL e anon key
- **Project Settings → API**:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (A `service_role` **não** é necessária para esta V1 e **nunca** deve ir ao cliente.)

---

## E. Criar projeto na Vercel
1. Acesse vercel.com → **Add New… → Project**.
2. **Import Git Repository** → autorize o GitHub e selecione o repositório.

## F. Conectar o repositório GitHub
- Já feito no passo E ao importar. A Vercel fará deploy a cada push na branch de produção.

## G. Definir o Root Directory
- Na tela de configuração do projeto (Import): **Root Directory → `webapp`**.
- Framework Preset: **Next.js** (detectado automaticamente).
- Build Command / Output: **deixe os padrões** (`next build`).

## H. Configurar as variáveis de ambiente na Vercel
Em **Settings → Environment Variables** (marque *Production* e *Preview*):

| Variável | Valor | Obrigatória |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL do Supabase | **Sim** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key | **Sim** |
| `NEXT_PUBLIC_SITE_URL` | `https://seu-app.vercel.app` | Recomendada |
| `ANTHROPIC_API_KEY` | chave da IA (chat responder de verdade) | Opcional |
| `AGENT_MODEL` | `claude-opus-4-8` (default) | Opcional |

> **Sem as duas primeiras, o app em produção falha fechado (HTTP 503)** — nenhuma
> rota protegida abre sem auth. Isso é proposital.

## I. Rodar o deploy
1. Clique **Deploy**. Aguarde o build.
2. Se você adicionar as variáveis **depois** do primeiro build, faça **Redeploy**
   (Deployments → ⋯ → Redeploy) para elas entrarem em vigor.
3. Copie a URL final (`https://seu-app.vercel.app`) e, se ainda não fez, coloque-a
   em **Supabase → Authentication → URL Configuration** (passo C.3).

## J. Testar produção
1. Abra `https://seu-app.vercel.app/` → deve mostrar a **landing** (deslogado).
2. **Entrar → criar usuário** (cadastro por e-mail/senha).
3. **Login** → deve cair em **/home**.
4. Abra **Configurações**, preencha os campos e **Salve** (deve mostrar
   "Configurações salvas com sucesso"; o banner de preview **não** deve aparecer).
5. **Recarregue** a página → os valores devem **voltar preenchidos**.
6. (Opcional) Em **Supabase → Table Editor → `users_profile`**: confira 1 linha com o
   seu `id` e os valores salvos.

---

## Checklist de segurança
- [ ] `.env.local` **não** foi commitado (está no `.gitignore`).
- [ ] Apenas `NEXT_PUBLIC_*` são expostas ao cliente; `ANTHROPIC_API_KEY` fica só no servidor.
- [ ] RLS ativa em todas as tabelas (o schema já faz isso).
- [ ] Bucket `documents` é **privado** e isolado por pasta de usuário.
- [ ] Produção sem Supabase → 503 (fail-closed), nunca abre sem auth.

## Limitações conhecidas (V1)
- **Recuperação de senha**: o botão dispara o e-mail do Supabase, mas a rota
  `/auth/callback` ainda **não** foi implementada (fica para a V2). O login por
  e-mail/senha funciona normalmente.
- Dashboard, Documentos, Metas, Receitas/Despesas e respostas do Agente ainda usam
  **dados de exemplo (mock)** — só **Configurações** persiste no banco nesta V1.
- Sem upload/parser de PDF ainda (V2).
