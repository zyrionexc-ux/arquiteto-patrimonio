-- =====================================================================
-- Arquiteto de Patrimônio — schema inicial (Supabase / Postgres)
-- Rodar no SQL Editor do Supabase. Idempotente: pode ser reexecutado sem erro
-- (tabelas com IF NOT EXISTS; policies com DROP POLICY IF EXISTS antes do CREATE;
-- colunas com ADD COLUMN IF NOT EXISTS; FKs em blocos DO com exception guard).
-- Segurança: RLS em todas as tabelas (auth.uid() = user_id).
--            Cartão: só os 4 últimos dígitos (nunca número completo/CVV).
-- =====================================================================

-- ------- Enums -------------------------------------------------------
do $$ begin
  create type document_kind as enum ('fatura','extrato_bancario','extrato_cartao_aberto');
exception when duplicate_object then null; end $$;

do $$ begin
  create type document_status as enum ('enviado','processado','precisa_revisar');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tx_direction as enum ('entrada','saida');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tx_source as enum ('manual','fatura','extrato');
exception when duplicate_object then null; end $$;

do $$ begin
  create type recurring_kind as enum ('receita_fixa','receita_variavel','despesa_fixa','despesa_variavel');
exception when duplicate_object then null; end $$;

do $$ begin
  create type agent_role as enum ('user','assistant');
exception when duplicate_object then null; end $$;

-- ------- users_profile ----------------------------------------------
create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  monthly_income numeric(12,2),
  cost_of_living numeric(12,2),
  risk_profile text check (risk_profile in ('conservador','moderado','arrojado')),
  current_reserve numeric(12,2) default 0,
  main_goal text,                       -- objetivo principal (resumo)
  reserve_target numeric(12,2),         -- meta de reserva
  notes text,                           -- observações importantes
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir colunas em bases já existentes (idempotente):
alter table public.users_profile add column if not exists main_goal text;
alter table public.users_profile add column if not exists reserve_target numeric(12,2);
alter table public.users_profile add column if not exists notes text;

-- ------- settings (preferências do agente) --------------------------
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  agent_tone text default 'firme_humano',
  use_financial_context boolean default true,
  preferences jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ------- documents ---------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind document_kind not null,
  reference_month date,                 -- 1º dia do mês de referência
  status document_status not null default 'enviado',
  storage_path text not null,           -- documents/{user_id}/...
  original_name text,
  created_at timestamptz not null default now()
);

-- ------- financial_months (agregados mensais) -----------------------
create table if not exists public.financial_months (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,                  -- 1º dia do mês
  receitas numeric(12,2) default 0,
  despesas numeric(12,2) default 0,
  saldo_final numeric(12,2),
  gastos_cartao_pagos numeric(12,2) default 0,
  encargos_conta numeric(12,2) default 0,
  unique (user_id, month)
);

-- ------- transactions ------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  description text not null,
  amount numeric(12,2) not null,
  direction tx_direction not null,
  macro_category text,
  macro_group text,
  source tx_source not null default 'manual',
  card_last4 char(4) check (card_last4 ~ '^[0-9]{4}$'),
  month date,
  -- proveniência (FKs adicionadas mais abaixo, após credit_card_bills existir):
  document_id uuid,   -- de qual PDF/documento veio
  bill_id uuid,       -- a qual fatura pertence (quando é lançamento de cartão)
  created_at timestamptz not null default now()
);

-- ------- credit_card_bills ------------------------------------------
create table if not exists public.credit_card_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  competencia date,
  vencimento date,
  total numeric(12,2),
  pago_conta numeric(12,2),
  diferenca numeric(12,2),
  situacao text,
  pagamento_antecipado numeric(12,2) default 0,
  encargos numeric(12,2) default 0,
  total_parcelado_proximas numeric(12,2),
  status text,
  card_last4 char(4) check (card_last4 ~ '^[0-9]{4}$'),
  created_at timestamptz not null default now()
);

-- ------- proveniência das transações (FKs + índices) ----------------
-- Colunas já declaradas em transactions; garantimos em bases já existentes
-- e criamos as FKs aqui, onde documents e credit_card_bills já existem.
alter table public.transactions add column if not exists document_id uuid;
alter table public.transactions add column if not exists bill_id uuid;

do $$ begin
  alter table public.transactions
    add constraint transactions_document_id_fkey
    foreign key (document_id) references public.documents(id) on delete set null;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.transactions
    add constraint transactions_bill_id_fkey
    foreign key (bill_id) references public.credit_card_bills(id) on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists transactions_user_date_idx on public.transactions (user_id, date);
create index if not exists transactions_document_id_idx on public.transactions (document_id);
create index if not exists transactions_bill_id_idx on public.transactions (bill_id);

-- ------- goals -------------------------------------------------------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  kind text,                            -- reserva, quitar_divida, compra, aporte...
  target_amount numeric(12,2) not null,
  current_amount numeric(12,2) default 0,
  deadline date,
  created_at timestamptz not null default now()
);

-- ------- recurring_items --------------------------------------------
create table if not exists public.recurring_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind recurring_kind not null,
  name text not null,
  amount numeric(12,2) not null,
  recurrence text default 'mensal',     -- mensal, semanal, anual, pontual
  active boolean default true,
  created_at timestamptz not null default now()
);

-- ------- agent_messages ---------------------------------------------
create table if not exists public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role agent_role not null,
  content text not null,
  used_financial_context boolean default false,
  created_at timestamptz not null default now()
);

-- ------- alerts ------------------------------------------------------
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  level text not null,                  -- Urgente, Atenção, Revisar, Oportunidade, Monitorar
  title text not null,
  value_text text,
  why text,
  action text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Row Level Security — cada usuário só enxerga o que é dele
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'users_profile','settings','documents','financial_months','transactions',
    'credit_card_bills','goals','recurring_items','agent_messages','alerts'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- users_profile / settings usam a coluna id/user_id como dono
-- (drop-if-exists antes de cada create → schema reexecutável sem erro)
drop policy if exists "own_profile" on public.users_profile;
create policy "own_profile" on public.users_profile
  for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "own_settings" on public.settings;
create policy "own_settings" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Demais tabelas: política padrão por user_id (idempotente via drop-if-exists)
do $$
declare t text;
begin
  foreach t in array array[
    'documents','financial_months','transactions','credit_card_bills',
    'goals','recurring_items','agent_messages','alerts'
  ] loop
    execute format($f$
      drop policy if exists "own_rows_select" on public.%1$I;
      create policy "own_rows_select" on public.%1$I for select using (auth.uid() = user_id);
      drop policy if exists "own_rows_insert" on public.%1$I;
      create policy "own_rows_insert" on public.%1$I for insert with check (auth.uid() = user_id);
      drop policy if exists "own_rows_update" on public.%1$I;
      create policy "own_rows_update" on public.%1$I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
      drop policy if exists "own_rows_delete" on public.%1$I;
      create policy "own_rows_delete" on public.%1$I for delete using (auth.uid() = user_id);
    $f$, t);
  end loop;
end $$;

-- =====================================================================
-- Trigger: cria perfil + settings quando um usuário se cadastra
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users_profile (id, full_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
    on conflict (id) do nothing;
  insert into public.settings (user_id) values (new.id)
    on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Storage: bucket privado 'documents' + policies por pasta do usuário
-- Caminho esperado: {user_id}/{tipo}/{arquivo}
-- =====================================================================
insert into storage.buckets (id, name, public)
  values ('documents','documents', false)
  on conflict (id) do nothing;

drop policy if exists "docs_read_own" on storage.objects;
create policy "docs_read_own" on storage.objects for select
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "docs_insert_own" on storage.objects;
create policy "docs_insert_own" on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "docs_update_own" on storage.objects;
create policy "docs_update_own" on storage.objects for update
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "docs_delete_own" on storage.objects;
create policy "docs_delete_own" on storage.objects for delete
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
