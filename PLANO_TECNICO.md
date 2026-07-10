# Plano Técnico — Arquiteto de Patrimônio (Web)

Versão web privada, multi-dispositivo, do agente financeiro. Convive com o
dashboard Streamlit em `dashboard/` (que **não** é alterado). Foco da V1:
base segura, autenticada e pronta para crescer — telas com dados mockados.

---

## 1. Qual stack usar

| Camada | Escolha |
|---|---|
| Framework | **Next.js 14** (App Router, TypeScript, Server Components) |
| Estilo | **Tailwind CSS** (design system premium via tokens) |
| Auth | **Supabase Auth** (e-mail + senha, recuperação, sessão por cookie) |
| Banco | **Supabase Postgres** (com Row Level Security por `user_id`) |
| Arquivos | **Supabase Storage** (bucket privado `documents`) |
| Agente | **API de IA** (Anthropic Claude por padrão) via route handler no servidor |
| Voz (futuro) | Transcrição de áudio (Whisper/API) → texto → mesmo fluxo do chat |
| Hospedagem (futuro) | Vercel (frontend) + Supabase (backend gerenciado) |

## 2. Por que essa stack

- **Next.js**: um só projeto para UI + API (route handlers), Server Components
  para buscar dados com segurança (sem expor chaves no cliente), ótimo em mobile.
- **Tailwind**: mantém a identidade premium já criada no Streamlit, responsivo.
- **Supabase**: Auth + Postgres + Storage integrados, com **RLS** nativo — o
  isolamento por usuário é feito no banco, não só no código. Reduz superfície de erro.
- **IA no servidor**: a chave da IA nunca vai ao navegador; o contexto financeiro
  é montado no backend a partir dos dados do próprio usuário.

## 3. Como será o login

- Supabase Auth com **e-mail + senha**. Sessão persistida em **cookies httpOnly**
  (pacote `@supabase/ssr`), lida no servidor via middleware.
- **Recuperação de senha** preparada (`resetPasswordForEmail` + rota de callback).
- **Middleware** protege todas as rotas do grupo `(app)`; sem sessão → `/login`.
- Nunca guardamos senha manualmente — quem cuida é o Supabase Auth.

## 4. Como serão armazenados documentos

- Bucket **privado** `documents` no Supabase Storage.
- Caminho sempre prefixado pelo usuário: `documents/{user_id}/{tipo}/{arquivo}`.
- Policy de Storage garante que cada usuário só lê/escreve na sua pasta.
- Metadados na tabela `documents` (tipo, mês de referência, status). O PDF em si
  fica no Storage; o banco guarda só o `storage_path` e os campos de controle.
- **Parser de PDF não entra na V1** — upload + catalogação primeiro.

## 5. Como serão armazenadas metas, receitas, despesas e análises

Tudo em Postgres, uma linha por usuário (`user_id` + RLS):
- `goals` — metas (tipo, alvo, atual, prazo, progresso derivado).
- `recurring_items` — receitas/despesas fixas e variáveis, com flag de recorrência.
- `transactions` — lançamentos (origem: manual, fatura, extrato).
- `financial_months` — agregados por mês (receita, despesa, saldo, fatura, encargos).
- `credit_card_bills` — faturas (total, pago, diferença, situação) — **só final do cartão**.
- `alerts` — avisos gerados (nível, título, valor, por quê, o que fazer).
- `agent_messages` — histórico do chat com o agente.

## 6. Como o agente conversará comigo

- Página **Chat** (client) envia mensagens para `POST /api/chat` (route handler).
- O servidor: autentica o usuário → (opcional) monta **contexto financeiro** a
  partir das tabelas dele → chama a **API de IA** → grava pergunta e resposta em
  `agent_messages` → devolve o texto.
- Botão **"usar contexto financeiro"** liga/desliga o envio dos números do usuário
  no prompt (privacidade e custo sob controle).
- Chave de IA só existe no servidor (variável de ambiente).

## 7. Como a voz entrará futuramente (V2)

- Botão de microfone grava áudio no cliente → envia para `POST /api/voice`.
- Backend transcreve (Whisper/API de transcrição) → texto → mesmo pipeline do chat.
- Resposta pode ser lida com TTS opcional. Nada disso entra na V1 (só deixamos o
  espaço reservado na UI e a rota planejada).

## 8. Como proteger meus dados

- **Auth gerenciado** (sem senha em texto, nunca).
- **RLS em todas as tabelas**: `auth.uid() = user_id` — isolamento no banco.
- **Storage privado** com policies por pasta de usuário.
- **Cartão**: apenas `card_last4` (4 dígitos), com `CHECK`. **Nunca** número
  completo, **nunca** CVV, **nunca** senha de banco.
- Chaves sensíveis (IA, `service_role`) só no servidor, via env — nunca no cliente.
- Uploads sempre vinculados ao `user_id` autenticado.

## 9. O que entra na V1

- Login (e-mail/senha) + recuperação preparada.
- Layout autenticado (sidebar + header + área principal), premium e responsivo.
- Telas com **dados mockados**: Dashboard (cards, score, nota, alertas, 7 dias),
  Documentos (upload + lista + status), Chat (UI + rota stub), Metas,
  Receitas/Despesas, Configurações.
- **Schema SQL** completo com RLS + bucket + trigger de perfil.
- Estrutura de pastas pronta para crescer.

## 10. O que fica para V2

- Parser real de PDF (faturas/extratos) → popular `transactions`/`bills`.
- Voz (transcrição + TTS).
- Deploy (Vercel + Supabase prod) e domínio.
- Gráficos interativos (portar a lógica do Streamlit).
- Geração automática de alertas/score no backend (hoje mockados).
- Notificações, exportação, multi-perfil, convites.

---

## Camada patrimonial futura (V2)

A V1 cobre bem o **controle financeiro** (documentos, transações, faturas, metas,
alertas, chat). Para o produto virar de fato um **Arquiteto de Patrimônio** — e não
só um controlador de faturas — a V2 precisa da camada patrimonial:

- **`assets` / `investments`** — reserva de emergência, aplicações, bens (o "quanto
  eu tenho").
- **`liabilities` / `debts`** — dívidas, parcelamentos e rotativo consolidados (o
  "quanto eu devo"), hoje só implícitos em `credit_card_bills`.
- **`net_worth_snapshots`** — fotografias periódicas do patrimônio líquido
  (ativos − dívidas) para desenhar a **evolução patrimonial no tempo**.

Sem essas tabelas, a futura aba **Patrimônio** (reserva atual, meta de reserva,
dívidas ruins, aporte possível, objetivos, evolução) não tem onde gravar. Elas
ficam para a V2, mas já entram no schema como próximo passo estrutural — é o que
conecta o diagnóstico atual ("recuperar sobra, fechar vazamentos") às etapas
seguintes do método (montar reserva → investir com método → proteger patrimônio).

---

### Mapa de rotas (V1)

```
/login                     (público)
/dashboard                 (protegido)
/documentos                (protegido)
/chat                      (protegido)
/metas                     (protegido)
/financas                  (protegido)  — receitas e despesas
/configuracoes             (protegido)
/api/chat        (POST)    — agente (stub, chama API de IA se configurada)
```
