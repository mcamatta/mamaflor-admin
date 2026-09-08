"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type UsuarioListItem = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

type ActionResult = { ok: boolean; message: string };
type Feedback = ActionResult & { type: "success" | "error" };
type CreateAction = (input: {
  nome: string;
  email: string;
  senha: string;
}) => Promise<ActionResult>;
type UpdateAction = (
  id: string,
  input: { nome: string; email: string },
) => Promise<ActionResult>;
type RemoveAction = (id: string) => Promise<ActionResult>;

type UsersPanelProps = {
  mode: "list" | "create" | "view" | "edit";
  busca?: string;
  usuarios?: UsuarioListItem[];
  usuario?: UsuarioListItem;
  createAction?: CreateAction;
  updateAction?: UpdateAction;
  removeAction?: RemoveAction;
};

function formatarData(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

function campo(formData: FormData, nome: string) {
  const value = formData.get(nome);
  return typeof value === "string" ? value : "";
}

function FeedbackAlert({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;

  return (
    <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
      <AlertTitle>
        {feedback.type === "success"
          ? "Operação concluída"
          : "Não foi possível concluir"}
      </AlertTitle>
      <AlertDescription>{feedback.message}</AlertDescription>
    </Alert>
  );
}

export function UsersPanel({
  mode,
  busca = "",
  usuarios = [],
  usuario,
  createAction,
  updateAction,
  removeAction,
}: UsersPanelProps) {
  const [confirmacao, setConfirmacao] = useState<UsuarioListItem | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pendente, startTransition] = useTransition();

  function exibirResultado(resultado: ActionResult) {
    setFeedback({ ...resultado, type: resultado.ok ? "success" : "error" });
  }

  function criar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createAction) return;
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const resultado = await createAction({
        nome: campo(formData, "nome"),
        email: campo(formData, "email"),
        senha: campo(formData, "senha"),
      });
      exibirResultado(resultado);
    });
  }

  function editar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!usuario || !updateAction) return;
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const resultado = await updateAction(usuario.id, {
        nome: campo(formData, "nome"),
        email: campo(formData, "email"),
      });
      exibirResultado(resultado);
    });
  }

  function excluir() {
    if (!confirmacao || !removeAction) return;
    const usuarioParaExcluir = confirmacao;

    startTransition(async () => {
      const resultado = await removeAction(usuarioParaExcluir.id);
      exibirResultado(resultado);
      if (resultado.ok) setConfirmacao(null);
    });
  }

  if (mode === "create") {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Novo usuário</CardTitle>
            <CardDescription>
              Defina as credenciais de acesso para a nova conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FeedbackAlert feedback={feedback} />
            <form className="grid max-w-lg gap-4" onSubmit={criar}>
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" name="nome" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" required type="email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  minLength={8}
                  name="senha"
                  required
                  type="password"
                />
                <p className="text-muted-foreground text-sm">
                  Use ao menos 8 caracteres.
                </p>
              </div>
              <div className="flex gap-2">
                <Button disabled={pendente} type="submit">
                  {pendente ? "Criando..." : "Criar usuário"}
                </Button>
                <Button asChild disabled={pendente} variant="outline">
                  <Link href="/dashboard/usuarios">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "view" && usuario) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do usuário</CardTitle>
            <CardDescription>Confira os dados da conta selecionada.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Nome</p>
              <p className="font-medium">{usuario.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">E-mail</p>
              <p className="font-medium">{usuario.email}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/dashboard/usuarios/${usuario.id}/editar`}>Editar</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/usuarios">Fechar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "edit" && usuario) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Editar usuário</CardTitle>
            <CardDescription>
              A senha atual não será alterada nesta edição.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FeedbackAlert feedback={feedback} />
            <form className="grid max-w-lg gap-4" onSubmit={editar}>
              <div className="grid gap-2">
                <Label htmlFor="editar-nome">Nome</Label>
                <Input
                  defaultValue={usuario.name}
                  id="editar-nome"
                  name="nome"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editar-email">E-mail</Label>
                <Input
                  defaultValue={usuario.email}
                  id="editar-email"
                  name="email"
                  required
                  type="email"
                />
              </div>
              <div className="flex gap-2">
                <Button disabled={pendente} type="submit">
                  {pendente ? "Salvando..." : "Salvar alterações"}
                </Button>
                <Button asChild disabled={pendente} variant="outline">
                  <Link href={`/dashboard/usuarios/${usuario.id}`}>Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="grid gap-1.5">
              <CardTitle>Usuários do sistema</CardTitle>
              <CardDescription>
                Gerencie as contas que podem acessar o painel.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/usuarios/novo">Novo usuário</Link>
            </Button>
          </div>
          <form
            action="/dashboard/usuarios"
            className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-end"
            method="get"
          >
            <div className="grid flex-1 gap-2">
              <Label htmlFor="q">Buscar</Label>
              <Input
                defaultValue={busca}
                id="q"
                name="q"
                placeholder="Nome ou e-mail"
              />
            </div>
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </form>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FeedbackAlert feedback={feedback} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Atualizado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="text-muted-foreground whitespace-normal"
                    colSpan={5}
                  >
                    {busca
                      ? "Nenhum usuário corresponde à busca informada."
                      : "Nenhum usuário cadastrado até o momento."}
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium whitespace-normal">
                      {item.name}
                    </TableCell>
                    <TableCell className="whitespace-normal">{item.email}</TableCell>
                    <TableCell>{formatarData(item.createdAt)}</TableCell>
                    <TableCell>{formatarData(item.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/dashboard/usuarios/${item.id}`}>Ver</Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/dashboard/usuarios/${item.id}/editar`}>
                            Editar
                          </Link>
                        </Button>
                        <Button
                          onClick={() => {
                            setFeedback(null);
                            setConfirmacao(item);
                          }}
                          size="sm"
                          type="button"
                          variant="destructive"
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {confirmacao ? (
        <div
          aria-labelledby="confirmar-exclusao-titulo"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          role="dialog"
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle id="confirmar-exclusao-titulo">Excluir usuário?</CardTitle>
              <CardDescription>
                {`A conta de ${confirmacao.name} perderá o acesso ao painel. Esta ação não pode ser desfeita.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                disabled={pendente}
                onClick={excluir}
                type="button"
                variant="destructive"
              >
                {pendente ? "Excluindo..." : "Excluir usuário"}
              </Button>
              <Button
                disabled={pendente}
                onClick={() => setConfirmacao(null)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
