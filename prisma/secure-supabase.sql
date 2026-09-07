-- Execute este arquivo no SQL Editor do Supabase depois da primeira migration.
-- O app usa Better Auth + Prisma no servidor; anon/authenticated não precisam
-- acessar estas tabelas pela Data API do Supabase.

alter table public."user" enable row level security;
alter table public."session" enable row level security;
alter table public."account" enable row level security;
alter table public."verification" enable row level security;

revoke all on table public."user" from anon, authenticated;
revoke all on table public."session" from anon, authenticated;
revoke all on table public."account" from anon, authenticated;
revoke all on table public."verification" from anon, authenticated;

-- Ao adicionar tabelas de negócio em public (Person, Notification etc.),
-- habilite RLS e crie políticas compatíveis com o modelo de acesso antes de
-- disponibilizá-las pela Data API.
