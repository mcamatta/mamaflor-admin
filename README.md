# Starter administrativo para associação

Base enxuta para um gerenciador em **Next.js 16**, combinando a autenticação do
[Achour/nextjs-better-auth](https://github.com/Achour/nextjs-better-auth) com o
bloco oficial **dashboard-01** do [shadcn/ui](https://ui.shadcn.com/blocks).

## O que já está pronto

- Better Auth com e-mail e senha
- cadastro controlado por variável de ambiente
- rotas `/dashboard/*` protegidas no proxy e no servidor
- Prisma 7 com PostgreSQL
- configuração pronta para Supabase (Session Pooler no runtime e direta no CLI)
- dashboard responsivo com sidebar, cards, gráfico, tabela e modo escuro
- telas que marcam os pontos de extensão de Pessoas, Notificações e Usuários
- script de proteção das tabelas do Better Auth no Data API do Supabase

As telas de Pessoas, Notificações e Usuários são intencionalmente placeholders.
Elas não simulam CRUD nem regras de negócio que ainda não existem.

## Stack

- Next.js 16 + React 19 + TypeScript
- Better Auth
- Prisma 7 + `@prisma/adapter-pg`
- PostgreSQL / Supabase
- Tailwind CSS 4 + shadcn/ui

## Configuração local com Supabase

1. Crie um projeto no Supabase.
2. Em **Connect**, copie duas URLs:
   - Session Pooler (porta `5432`) para `DATABASE_URL`.
   - conexão direta para `DIRECT_URL` (ou o Session Pooler em redes IPv4).
3. Copie e preencha o arquivo de ambiente:

```bash
cp .env.example .env
openssl rand -base64 32
```

Coloque o valor gerado em `BETTER_AUTH_SECRET`.

4. Instale e crie as tabelas:

```bash
npm ci
npm run db:migrate
```

5. No SQL Editor do Supabase, execute `prisma/secure-supabase.sql`.
6. Inicie a aplicação:

```bash
npm run dev
```

Acesse `http://localhost:3000/signup` para criar o primeiro usuário. Depois,
defina `ALLOW_PUBLIC_SIGN_UP="false"` no ambiente de produção para bloquear
novos cadastros públicos.

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `BETTER_AUTH_SECRET` | assinatura e proteção dos dados da autenticação |
| `BETTER_AUTH_URL` | URL pública da aplicação |
| `ALLOW_PUBLIC_SIGN_UP` | libera ou bloqueia cadastro por e-mail |
| `DATABASE_URL` | conexão usada pelo app no runtime |
| `DATABASE_POOL_SIZE` | máximo de conexões por instância do app |
| `DIRECT_URL` | conexão usada pelo Prisma CLI e migrations |

O Supabase é usado somente como PostgreSQL. Este projeto não usa Supabase Auth,
o SDK do Supabase nem as chaves `anon`/`service_role`.

## Comandos

```bash
npm run dev          # desenvolvimento
npm run typecheck    # verificação TypeScript
npm run build        # build de produção
npm run db:migrate   # cria/aplica migration de desenvolvimento
npm run db:deploy    # aplica migrations em produção
npm run db:studio    # abre o Prisma Studio
```

## Estrutura principal

```text
app/
├── api/auth/[...all]       # handler do Better Auth
├── login                   # entrada
├── signup                  # primeiro cadastro
└── (dashboard)/dashboard   # área protegida
    ├── pessoas
    ├── notificacoes
    ├── usuarios
    ├── account
    └── setting

components/                 # dashboard-01 e componentes shadcn
lib/auth.ts                 # configuração Better Auth
lib/prisma.ts               # Prisma singleton
prisma/schema.prisma        # tabelas de autenticação
prisma/secure-supabase.sql  # RLS/revogação do Data API
proxy.ts                    # redirecionamento otimista por cookie
```

O proxy faz uma verificação rápida do cookie. A proteção definitiva permanece no
layout do servidor, que valida a sessão no Better Auth antes de renderizar dados.

## Próximos módulos do MVP

1. adicionar `Person` ao schema Prisma e implementar o CRUD;
2. adicionar `Notification` e o histórico de envio;
3. criar `/api/cron/notifications` com segredo e idempotência;
4. adicionar roles quando houver mais de um perfil de acesso.

## Créditos

Este projeto deriva do starter de [Achour Meguenni](https://github.com/Achour)
e usa componentes abertos do [shadcn/ui](https://ui.shadcn.com/).
