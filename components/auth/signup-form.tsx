"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconAlertCircle, IconLoader2 } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    await authClient.signUp.email(
      { name, email, password, callbackURL: "/dashboard" },
      {
        onSuccess: () => {
          router.replace("/dashboard");
          router.refresh();
        },
        onError: ({ error: authError }) => {
          setError(authError.message || "Não foi possível criar a conta.");
          setLoading(false);
        },
      }
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>
            Cadastre o primeiro usuário administrativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <IconAlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  autoComplete="name"
                  id="name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  required
                  value={name}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  autoComplete="email"
                  id="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@associacao.org.br"
                  required
                  type="email"
                  value={email}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Senha</Label>
                <Input
                  autoComplete="new-password"
                  id="password"
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
                <p className="text-xs text-muted-foreground">Use pelo menos 8 caracteres.</p>
              </div>
              <Button disabled={loading} type="submit" className="w-full">
                {loading && <IconLoader2 className="animate-spin" />}
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
            </div>
            <div className="mt-5 text-center text-sm text-muted-foreground">
              Já possui conta?{" "}
              <Link href="/login" className="text-foreground underline underline-offset-4">
                Entrar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
