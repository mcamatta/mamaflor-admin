"use client";

import { Button } from "@/components/ui/button";

export function InativarPessoaButton({
  action,
  nome,
}: {
  action: () => Promise<void>;
  nome: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const ok = window.confirm(
          `Inativar ${nome}? A pessoa sairá da listagem ativa e o histórico será preservado.`,
        );
        if (!ok) event.preventDefault();
      }}
    >
      <Button size="sm" type="submit" variant="destructive">
        Inativar
      </Button>
    </form>
  );
}
