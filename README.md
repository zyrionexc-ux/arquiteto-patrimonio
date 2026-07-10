# Arquiteto de Patrimônio — Web (V1)

Versão web privada, multi-dispositivo, do agente financeiro. Convive com o
dashboard Streamlit em `../dashboard/` (que **não** é alterado). Esta V1 entrega
a base autenticada com telas premium e dados mockados — sem parser de PDF, sem
voz, sem deploy (esses ficam para V2). Veja `PLANO_TECNICO.md`.

## Stack

Next.js 14 (App Router, TypeScript) · Tailwind · Supabase (Auth + Postgres +
Storage) · API de IA (Anthropic) no servidor.

## Deploy gratuito

Publicação em **Vercel** (Next.js) + **Supabase** (Auth/DB/Storage) + **GitHub** —
passo a passo completo em **[`DEPLOY.md`](./DEPLOY.md)**. Resumo:

1. Supabase: criar projeto → rodar `supabase/schema.sql` (2×) → habilitar Email → copiar
   `Project URL` e `anon key`.
2. Vercel: importar o repo do GitHub → **Root Directory = `webapp`** → cadastrar as
   variáveis (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `NEXT_PUBLIC_SITE_URL`; `ANTHROPIC_API_KEY`/`AGENT_MODEL` opcionais) → **Deploy**.
3. Testar: landing → criar usuário → login → salvar Configurações → recarregar → persistiu.

> **Produção sem Supabase falha fechada (HTTP 503):** nenhuma rota protegida abre sem
> autenticação; o modo preview/mock só existe em desenvolvimento local.

## Direção visual (clean, calma e confiável)

Linguagem **clara, calma, profissional e confiável** (inspiração: home da Base44).
O produto deve transmitir segurança e organização, não "dashboard técnico".

- **Sem emojis** em nenhuma tela.
- **Cards de vidro**: fundo translúcido (`rgba(255,255,255,0.82)`), borda neutra
  discreta (`rgba(23,26,31,0.06)`), **sombra suave** (`0 18px 45px …`),
  `backdrop-filter: blur(12px)`, cantos de 24px. **Sem faixas/bordas coloridas**
  no topo ou lateral — cor só aparece em **badges, links e botões**.
- **Hover ético**: leve elevação (−2px) e sombra um pouco maior; nunca cores fortes.
- **Badges consultivos e discretos** (cor só no badge, card neutro):
  Urgente `#B45309/#FEF3C7` · Atenção `#A16207/#FEF9C3` · Monitorar `#0369A1/#E0F2FE`
  · Revisar `#475569/#F1F5F9` · OK `#047857/#D1FAE5`.
- **Alertas consultivos**, não alarmistas: card neutro, badge no topo, título forte,
  valor, "Por que importa" e "O que fazer agora".
- **Sinais de confiança** discretos (landing e home): *Dados privados*, *Sem acesso
  ao banco*, *Análises com evidências*, *Você controla os documentos enviados*.
- **Microinterações éticas**: hover suave, feedback de salvo, progresso visível,
  próxima ação clara — sem contadores artificiais, urgência falsa ou loops.

**Paleta** (tokens em `tailwind.config.ts`):
- Fundo/gradiente: `#C4DEE8` · `#B8D6E2` · `#E8ECEA` · `#F7F8F6`
- Texto: `#171A1F` (`txt`) · `#404752` (`txt3`) · `#6E7682` (`txt2`)
- Superfícies: `#FFFFFF` (`card`) · `#F1F3F2` (`card2`) · borda `#D8DEDB`
- Acento principal: `#F39A60` (`gold`), hover `#E98A4B`
- Acentos calmos: verde `#4B9E86`, azul `#5E97B8`, sage `#AFC8BE`, teal `#9FC7CC`, vermelho `#D9584F`

**Fluxo (menos no 1º contato, profundidade ao avançar):**
1. **Landing** deslogada minimalista — nome, headline, subtítulo, CTA *Entrar* +
   *Conhecer a plataforma*, 3 blocos de valor.
2. **Login** elegante — card claro, campos grandes, sem excesso.
3. **Home interna** limpa — saudação + frase + "O que você quer fazer agora?" com
   poucos cards (hub de navegação).
4. Só então os detalhamentos (Dashboard, evidências, etc.).

**Navegação:** o header autenticado traz **Voltar** e **Home** em todas as telas
(discretos); a sidebar lista as áreas sem ícones/emoji, com estado ativo sutil.

**Design system** (`globals.css`): `.card`, `.surface`, `.input`, `.btn-gold`,
`.btn-ghost`, `.badge`, `.sec-title/.sec-sub`, `.link-muted`. Componentes em
`src/components/ui.tsx`. O tema **escuro** do Streamlit (`../dashboard/`) permanece
inalterado — esta direção clara vale só para o webapp.

## Rodar localmente

```bash
cd webapp
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev                  # http://localhost:3000
```

> **Modo preview × produção (importante):**
> - O **modo preview** (mock, sem login) só funciona em **desenvolvimento local**
>   (`NODE_ENV !== "production"`) quando as variáveis do Supabase estão ausentes.
> - Em **produção**, se faltar `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
>   o app **falha fechado** (HTTP 503) — nunca abre rota protegida sem autenticação.
> - O **`supabase/schema.sql` é idempotente**: pode ser reexecutado quantas vezes
>   precisar sem erro de "policy already exists" (usa `drop policy if exists` antes
>   de cada `create policy`, `add column if not exists` e FKs com guarda).

## Variáveis de ambiente (`.env.local`)

| Variável | Para quê | Obrigatória |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Para auth/dados |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima (cliente) | Para auth/dados |
| `SUPABASE_SERVICE_ROLE_KEY` | Operações admin (servidor) | Opcional (V2) |
| `ANTHROPIC_API_KEY` | Agente de IA (servidor) | Para o chat responder de verdade |
| `AGENT_MODEL` | Modelo de IA (default `claude-opus-4-8`) | Não |
| `NEXT_PUBLIC_SITE_URL` | URL base (recuperação de senha) | Recomendada |

## Rastreabilidade das análises

Todo número consolidado do produto pode ser **aberto** para entender de onde veio.
No **Dashboard**, a seção **"Análises com evidências"** traz cards com botão
**"Ver detalhes →"** que abrem um painel lateral (`EvidenceDrawer`) com, para cada item:

- **De onde veio** (origem: Extrato bancário, Fatura do cartão, Extrato em aberto,
  Configurações, Regra do agente, Lançamentos manuais);
- **Como o agente identificou** (a regra aplicada);
- **Por que importa** (explicação curta);
- **O que fazer agora** (ação prática) e um **status** (Urgente/Atenção/Revisar/Monitorar/OK).

Análises já com evidências: **Vazamentos**, **Score de Construção Patrimonial**,
**Fatura em aberto** e **Alertas**.

> **Hoje as evidências são seed/exemplo** (espelham a análise validada do Bradesco) —
> o painel deixa isso explícito e **não** afirma que todos os lançamentos foram
> varridos. Quando o parser real existir, cada evidência poderá apontar para
> `document_id`, `transaction_id` e `bill_id` (campos já previstos no tipo
> `AnalysisEvidence` em `src/lib/analysis/evidences.ts`).

Componentes: `src/components/AnalysisCard.tsx`, `src/components/EvidenceDrawer.tsx`
(exporta `EvidenceItem`), tipos/seed em `src/lib/analysis/evidences.ts`.

## Maturidade de produto (navegação, rotina e dados reais × mock)

- **Menu mobile:** no celular, a barra superior traz **Voltar · Home · Menu**; ao tocar
  em **Menu** abre um drawer translúcido (blur, sombra leve) com Home, Diagnóstico,
  Documentos, Agente, Metas, Receitas e despesas, Configurações e **Sair**. No desktop,
  a navegação segue na sidebar e o **Sair** fica no header.
- **Rotina do mês** (Home interna): checklist "Sua rotina deste mês" com status
  **Concluído · Pendente · Em breve** para dar sensação de progresso — enquanto o
  upload/parser não existem, os itens de documento aparecem como *Em breve*.
- **Ação mais importante agora** (Diagnóstico): bloco de prioridade no topo, antes dos
  detalhes longos.
- **Agente:** tela consultiva (card inicial, sugestões de perguntas, toggle elegante de
  "usar meus dados", aviso discreto de modo inicial).

### Dados reais × mock/preview (transparência)
- **Real (persiste no Supabase):** Configurações (`users_profile` + `settings`).
- **Mock/preview (ainda não gravado/processado):** Dashboard, evidências, Documentos
  (lista de exemplo — "o upload real será conectado na próxima etapa"), Metas,
  Receitas/Despesas, rotina do mês e respostas do Agente sem chave de IA.
- As telas **avisam** quando o conteúdo é exemplo — nada dá falsa impressão de que
  arquivos reais foram processados.

### Próximos passos
1. Conectar **Documentos** ao Storage (upload real → `documents/{user_id}/…`).
2. Plugar **Metas** e **Receitas/Despesas** ao banco.
3. Parser de PDF → popular `transactions`/`credit_card_bills` e ligar as evidências a
   `document_id`/`transaction_id`/`bill_id`.

## Home consolidada (central de navegação)

Após o login o usuário cai na **Home** (`/home`), não mais no Dashboard. A Home é
a central do produto:

- **Cabeçalho premium** (nome, subtítulo, frase-guia).
- **"O que você quer fazer agora?"** — cards grandes para Dashboard, Documentos,
  Chat, Configurações, Metas e Receitas/Despesas.
- **"Importar documentos"** — 3 tipos previstos, cada um com botão "Enviar arquivo"
  que hoje leva para a página **Documentos** (upload real é V2).
- **"Rotina recomendada"** — passo a passo de 7 itens.
- **"Status do sistema"** — status real: Configurações *Conectado*, Metas *Pronto
  para conectar*, Documentos *Estrutura pronta*, Chat *Modo inicial*, Parser PDF *V2*, Voz *V2*.

A **raiz `/`** é a **landing pública** (deslogado): título, proposta, botões
**Entrar** / **Criar conta** (ambos vão para `/login`) e 3 blocos de valor —
sem nenhum dado sensível. Logado, `/` redireciona para `/home`.

### Fluxo recomendado
1. Configurações → 2. Metas → 3. Extrato bancário → 4. Faturas do cartão →
5. Extrato do cartão em aberto → 6. Conversar com o agente → 7. Revisar alertas.

### Tipos de documento previstos (referência para Storage/banco na V2)
- `extrato_bancario` — extrato da conta corrente
- `fatura_cartao` — faturas fechadas do cartão
- `extrato_cartao_mes_corrente` — consumo em aberto do mês atual

> Nota: o enum atual `document_kind` no `schema.sql` usa
> (`fatura`, `extrato_bancario`, `extrato_cartao_aberto`). Alinhar para esses três
> nomes canônicos fica como ajuste da V2 (junto com o upload real).

## Testar a tela Configurações (1ª tela conectada ao banco)

**Configurações** é a **primeira tela ligada ao Supabase** (tabelas `users_profile`
e `settings`) — serve para validar auth + RLS + CRUD no caminho mais simples.

**Variáveis necessárias** (em `.env.local`): `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. (A chave de IA e a service-role **não** são
necessárias para esta tela.)

**Passo a passo (com Supabase):**
1. Rodar `supabase/schema.sql` no SQL Editor (pode rodar 2× para conferir a idempotência).
2. Preencher `.env.local` com URL + anon key e `npm run dev`.
3. Criar um usuário (o cadastro dispara o trigger que cria `users_profile` + `settings`).
4. Fazer login → abrir **Configurações** → editar campos → **Salvar**.
5. Estados visíveis: **Salvando…**, **salvo com sucesso**, **erro ao salvar**,
   **sessão expirada** (com link para login).
6. Recarregar a página: os valores voltam preenchidos (leitura server-side por `user_id`).

**Sem Supabase (dev):** a tela abre em **modo preview** — dá para editar, mas o
"Salvar" apenas informa que nada foi gravado.

## O que configurar no Supabase

1. Criar um projeto em supabase.com.
2. Em **SQL Editor**, rodar `supabase/schema.sql` (cria tabelas, RLS, trigger de
   perfil e o bucket privado `documents` com policies por usuário).
3. Em **Authentication → Providers**, habilitar **Email** (senha).
4. Copiar `Project URL` e `anon key` (Settings → API) para o `.env.local`.
5. (Opcional) Ajustar templates de e-mail de recuperação de senha.

## Estrutura

```
webapp/
  PLANO_TECNICO.md          # plano técnico (10 respostas)
  README.md
  .env.example
  package.json · tsconfig.json · next.config.mjs · tailwind.config.ts · postcss.config.mjs
  supabase/schema.sql       # schema + RLS + storage + trigger
  src/
    middleware.ts           # protege rotas (app) quando o Supabase está ativo
    app/
      layout.tsx · globals.css · page.tsx
      login/page.tsx        # e-mail + senha + recuperação
      (app)/                # layout autenticado (sidebar + header)
        layout.tsx
        dashboard/          # cards, score, nota, alertas, 7 dias
        documentos/         # upload + lista + status
        chat/               # agente (UI + estrutura para voz)
        metas/              # metas + progresso
        financas/           # receitas/despesas fixas e variáveis
        configuracoes/      # dados básicos + preferências
      api/chat/route.ts     # agente (chama a API de IA se configurada)
    components/             # Sidebar, Header, ui (Card/Kpi/Badge/Alert/Score…)
    lib/
      env.ts · types.ts · mock.ts
      supabase/client.ts · server.ts · middleware.ts
```

## Segurança (V1)

- Senhas: apenas Supabase Auth (nunca armazenadas manualmente).
- Cartão: só `card_last4` (4 dígitos), com `CHECK` no schema. Nunca número
  completo, nunca CVV, nunca senha de banco.
- RLS em todas as tabelas (`auth.uid() = user_id`) + Storage privado por pasta
  de usuário. Chaves de IA/service-role só no servidor.

## Limites da V1 (para conferir / evoluir)

- **Dados mockados** em `src/lib/mock.ts` — nada é gravado no banco ainda.
- **Sem parser de PDF, sem voz, sem deploy** (V2).
- O chat só responde de verdade com `ANTHROPIC_API_KEY`; senão, resposta simulada.
- **Configurações já persiste** no Supabase (`users_profile` + `settings`). As demais
  (Metas, Documentos, Receitas/Despesas) ainda são mock, prontas para ligar ao banco.
