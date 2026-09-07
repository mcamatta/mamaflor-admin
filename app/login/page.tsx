import Link from "next/link";
import { IconLayoutDashboard } from "@tabler/icons-react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-6 md:p-10">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <IconLayoutDashboard className="size-4" />
        </span>
        Painel da Associação
      </Link>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </main>
  );
}
