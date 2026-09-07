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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const requestedCallback = new URLSearchParams(window.location.search).get(
      "callbackUrl"
    );
    const callbackUrl =
      requestedCallback?.startsWith("/") && !requestedCallback.startsWith("//")
        ? requestedCallback
        : "/dashboard";

    await authClient.signIn.email(
      { email, password, rememberMe: true, callbackURL: callbackUrl },
      {
        onSuccess: () => {
          router.replace(callbackUrl);
          router.refresh();
        },
        onError: ({ error: authError }) => {
          setError(authError.message || "Não foi possível entrar.");
          setLoading(false);
        },
      }
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Use seu e-mail e senha para acessar o painel.
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
                  autoComplete="current-password"
                  id="password"
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </div>
              <Button disabled={loading} type="submit" className="w-full">
                {loading && <IconLoader2 className="animate-spin" />}
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </div>
            <div className="mt-5 text-center text-sm text-muted-foreground">
              Primeiro acesso?{" "}
              <Link href="/signup" className="text-foreground underline underline-offset-4">
                Criar conta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
