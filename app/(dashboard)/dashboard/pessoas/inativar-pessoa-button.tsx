"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function InativarPessoaButton({
  action,
  nome,
}: {
  action: () => Promise<void>;
  nome: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [pendente, startTransition] = useTransition();

  function inativar() {
    startTransition(async () => {
      await action();
      setAberto(false);
    });
  }

  return (
    <>
      <Button
        onClick={() => setAberto(true)}
        size="sm"
        type="button"
        variant="destructive"
      >
        Inativar
      </Button>

      {aberto ? (
        <div
          aria-labelledby="confirmar-inativacao-titulo"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          role="dialog"
        >
          <Card className="w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 2xl:w-2/5">
            <CardHeader>
              <CardTitle id="confirmar-inativacao-titulo">
                Inativar pessoa?
              </CardTitle>
              <CardDescription>
                {`A pessoa ${nome} sairá da listagem ativa e o histórico será preservado.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                disabled={pendente}
                onClick={inativar}
                type="button"
                variant="destructive"
              >
                {pendente ? "Inativando..." : "Inativar pessoa"}
              </Button>
              <Button
                disabled={pendente}
                onClick={() => setAberto(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
