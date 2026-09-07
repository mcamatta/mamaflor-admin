import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  IconArrowRight,
  IconBell,
  IconChevronRight,
  IconLayoutDashboard,
  IconShieldCheckFilled,
  IconUsers,
} from "@tabler/icons-react";

const features = [
  {
    title: "Acesso protegido",
    description: "Sessões seguras com Better Auth e proteção no servidor.",
    icon: IconShieldCheckFilled,
  },
  {
    title: "Gestão de pessoas",
    description: "Base visual pronta para o CRUD dos associados.",
    icon: IconUsers,
  },
  {
    title: "Notificações",
    description: "Estrutura preparada para o cron job do MVP.",
    icon: IconBell,
  },
];

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const destination = session?.user ? "/dashboard" : "/login";

  return (
    <main className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b bg-background/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <IconLayoutDashboard className="size-5" />
            </span>
            Painel da Associação
          </Link>
          <nav className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild size="sm">
              <Link href={destination}>
                {session?.user ? "Abrir painel" : "Entrar"}
                <IconArrowRight />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="container flex flex-1 flex-col items-center justify-center gap-10 py-20 text-center">
        <div className="flex max-w-3xl flex-col items-center gap-6">
          <span className="rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
            Next.js + Better Auth + Prisma + shadcn/ui
          </span>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Uma base enxuta para começar seu gerenciador
          </h1>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground">
            Autenticação pronta, dashboard responsivo e PostgreSQL desacoplado do
            provedor. Conecte ao Supabase e comece pelas regras do seu produto.
          </p>
          <Button asChild size="lg">
            <Link href={destination}>
              Começar agora <IconChevronRight />
            </Link>
          </Button>
        </div>

        <div className="grid w-full max-w-5xl gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border bg-background p-6 text-left shadow-sm"
            >
              <feature.icon className="mb-5 size-6 text-primary" />
              <h2 className="font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t bg-background py-6">
        <div className="container text-center text-sm text-muted-foreground">
          Starter administrativo — personalize o nome e a identidade da associação.
        </div>
      </footer>
    </main>
  );
}
