import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const usuarioFields = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

const nomeSchema = z.string().trim().min(1, "Nome é obrigatório");
const emailSchema = z
  .string()
  .trim()
  .email("E-mail inválido")
  .transform((email) => email.toLowerCase());

export const usuarioCreateSchema = z.object({
  nome: nomeSchema,
  email: emailSchema,
  senha: z
    .string({ required_error: "Senha é obrigatória" })
    .min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export const usuarioUpdateSchema = z.object({
  nome: nomeSchema,
  email: emailSchema,
});

export type UsuarioCreateInput = z.infer<typeof usuarioCreateSchema>;
export type UsuarioUpdateInput = z.infer<typeof usuarioUpdateSchema>;

export class UsuarioError extends Error {}

function validar<T>(schema: z.ZodType<T>, input: unknown) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new UsuarioError(result.error.issues[0]?.message ?? "Dados inválidos");
  }
  return result.data;
}

function mensagemSegura(error: unknown, fallback: string) {
  const candidate = error as {
    body?: { code?: unknown };
    code?: unknown;
    message?: unknown;
  };
  const code = candidate.body?.code ?? candidate.code;
  const message = typeof candidate.message === "string" ? candidate.message : "";

  if (
    code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ||
    code === "USER_ALREADY_EXISTS" ||
    message.includes("USER_ALREADY_EXISTS")
  ) {
    return "Já existe uma conta com este e-mail";
  }
  if (code === "USER_NOT_FOUND" || message.includes("USER_NOT_FOUND")) {
    return "Usuário não encontrado";
  }
  if (
    code === "UNAUTHORIZED" ||
    code === "FORBIDDEN" ||
    message.includes("UNAUTHORIZED") ||
    message.includes("FORBIDDEN")
  ) {
    return "Não autorizado";
  }
  if (code === "INVALID_EMAIL" || message.includes("INVALID_EMAIL")) {
    return "E-mail inválido";
  }
  return fallback;
}

function tratarErro(error: unknown, fallback: string): never {
  if (error instanceof UsuarioError) throw error;
  throw new UsuarioError(mensagemSegura(error, fallback));
}

async function cabecalhosDaRequisicao(requestHeaders?: Headers) {
  return requestHeaders ?? (await headers());
}

async function exigirSessaoDashboard(requestHeaders: Headers) {
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user) {
    throw new UsuarioError("Não autenticado");
  }
  return session;
}

export async function listUsuarios(busca?: string) {
  const termo = busca?.trim();

  return prisma.user.findMany({
    where: termo
      ? {
          OR: [
            { name: { contains: termo, mode: "insensitive" } },
            { email: { contains: termo, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: usuarioFields,
    orderBy: { name: "asc" },
  });
}

export async function getUsuario(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: usuarioFields,
  });
}

export async function createUsuario(input: unknown, requestHeaders?: Headers) {
  const data = validar(usuarioCreateSchema, input);
  const headersAtuais = await cabecalhosDaRequisicao(requestHeaders);
  await exigirSessaoDashboard(headersAtuais);

  try {
    const result = await auth.api.createUser({
      headers: headersAtuais,
      body: { name: data.nome, email: data.email, password: data.senha },
    });
    return getUsuario(result.user.id);
  } catch (error) {
    return tratarErro(error, "Não foi possível criar o usuário");
  }
}

export async function updateUsuario(
  id: string,
  input: unknown,
  requestHeaders?: Headers,
) {
  const data = validar(usuarioUpdateSchema, input);
  const headersAtuais = await cabecalhosDaRequisicao(requestHeaders);
  await exigirSessaoDashboard(headersAtuais);

  try {
    await auth.api.adminUpdateUser({
      headers: headersAtuais,
      body: { userId: id, data: { name: data.nome, email: data.email } },
    });
    return getUsuario(id);
  } catch (error) {
    return tratarErro(error, "Não foi possível atualizar o usuário");
  }
}

export async function removeUsuario(id: string, requestHeaders?: Headers) {
  const headersAtuais = await cabecalhosDaRequisicao(requestHeaders);
  await exigirSessaoDashboard(headersAtuais);

  try {
    await auth.api.removeUser({
      headers: headersAtuais,
      body: { userId: id },
    });
  } catch (error) {
    return tratarErro(error, "Não foi possível remover o usuário");
  }
}
