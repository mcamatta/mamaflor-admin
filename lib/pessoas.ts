import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  DocumentoTipo,
  OleoPerfil,
  OleoVolume,
  PessoaSexo,
  PessoaStatus,
  PessoaTipo,
  Prisma,
  ProdutoTipo,
} from "@src/generated/prisma/client";

export const DOCUMENTO_TIPOS = [
  DocumentoTipo.FICHA_FILIACAO,
  DocumentoTipo.RG_CPF,
  DocumentoTipo.COMP_RESIDENCIA,
  DocumentoTipo.RECEITA_MEDICA,
  DocumentoTipo.LAUDO,
] as const;

const optionalText = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  });

const optionalDate = z.preprocess((value) => {
  if (value == null || value === "") return null;
  return value;
}, z.coerce.date().nullable());

const optionalDecimal = z.preprocess((value) => {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
}, z.number().nullable());

const produtoSchema = z
  .object({
    tipo: z.nativeEnum(ProdutoTipo),
    perfil: z.nativeEnum(OleoPerfil).nullable().optional(),
    diluicao: optionalDecimal,
    volume: z.nativeEnum(OleoVolume).nullable().optional(),
  })
  .superRefine((produto, ctx) => {
    if (produto.tipo === ProdutoTipo.OLEO && produto.diluicao == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Diluição é obrigatória para óleo",
        path: ["diluicao"],
      });
    }
  });

const pagamentoSchema = z.object({
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
  valor: optionalDecimal.optional(),
});

export const fichaSaveSchema = z.object({
  nome: z.string().trim().min(1, "Nome completo é obrigatório"),
  status: z.nativeEnum(PessoaStatus).optional().default(PessoaStatus.EM_DIA),
  tipo: z.nativeEnum(PessoaTipo).optional().default(PessoaTipo.HUMANO),
  cpf: optionalText,
  nascimento: optionalDate,
  sexo: z.nativeEnum(PessoaSexo).nullable().optional(),
  email: optionalText,
  telefone: optionalText,
  cep: optionalText,
  rua: optionalText,
  numero: optionalText,
  complemento: optionalText,
  bairro: optionalText,
  cidade: optionalText,
  uf: optionalText.refine(
    (value) => value == null || value.length <= 2,
    "UF deve ter até 2 caracteres",
  ),
  possuiResponsavel: z.boolean().optional().default(false),
  responsavelNome: optionalText,
  responsavelCpf: optionalText,
  validadeReceita: optionalDate,
  pastaFisica: z.boolean().optional().default(false),
  pastaVirtualUrl: optionalText,
  condicaoSaude: optionalText,
  prescritor: optionalText,
  valorTaxa: optionalDecimal,
  observacoes: optionalText,
  documentos: z
    .object({
      completos: z.boolean(),
      faltantes: z.array(z.nativeEnum(DocumentoTipo)).optional(),
    })
    .optional(),
  produtos: z.array(produtoSchema).optional().default([]),
  pagamento: pagamentoSchema.optional(),
  pedidoAtual: optionalText,
});

export type FichaSaveInput = z.infer<typeof fichaSaveSchema>;

const pessoaInclude = {
  documentos: true,
  produtos: true,
  pagamentos: { orderBy: { competencia: "desc" as const } },
  pedidos: { orderBy: { createdAt: "desc" as const } },
};

async function requireDashboardSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  return session;
}

function pessoaFields(data: FichaSaveInput) {
  return {
    nome: data.nome,
    status: data.status,
    tipo: data.tipo,
    cpf: data.cpf,
    nascimento: data.nascimento,
    sexo: data.sexo ?? null,
    email: data.email,
    telefone: data.telefone,
    cep: data.cep,
    rua: data.rua,
    numero: data.numero,
    complemento: data.complemento,
    bairro: data.bairro,
    cidade: data.cidade,
    uf: data.uf,
    possuiResponsavel: data.possuiResponsavel,
    responsavelNome: data.responsavelNome,
    responsavelCpf: data.responsavelCpf,
    validadeReceita: data.validadeReceita,
    pastaFisica: data.pastaFisica,
    pastaVirtualUrl: data.pastaVirtualUrl,
    condicaoSaude: data.condicaoSaude,
    prescritor: data.prescritor,
    valorTaxa: data.valorTaxa,
    observacoes: data.observacoes,
  };
}

export async function saveFicha(input: unknown, id?: number) {
  const data = fichaSaveSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const fields = pessoaFields(data);
    const pessoa = id
      ? await tx.pessoa.update({ where: { id }, data: fields })
      : await tx.pessoa.create({ data: fields });

    if (data.documentos) {
      for (const tipo of DOCUMENTO_TIPOS) {
        const presente = data.documentos.completos
          ? true
          : !data.documentos.faltantes?.includes(tipo);

        await tx.pessoaDocumento.upsert({
          where: { pessoaId_tipo: { pessoaId: pessoa.id, tipo } },
          create: { pessoaId: pessoa.id, tipo, presente },
          update: { presente },
        });
      }
    }

    await tx.pessoaProduto.deleteMany({ where: { pessoaId: pessoa.id } });
    if (data.produtos.length > 0) {
      await tx.pessoaProduto.createMany({
        data: data.produtos.map((produto) => ({
          pessoaId: pessoa.id,
          tipo: produto.tipo,
          perfil:
            produto.tipo === ProdutoTipo.OLEO ? (produto.perfil ?? null) : null,
          diluicao:
            produto.tipo === ProdutoTipo.OLEO
              ? (produto.diluicao ?? null)
              : null,
          volume:
            produto.tipo === ProdutoTipo.OLEO ? (produto.volume ?? null) : null,
        })),
      });
    }

    if (data.pagamento) {
      const valor = data.pagamento.valor ?? data.valorTaxa ?? null;
      await tx.pessoaPagamento.upsert({
        where: {
          pessoaId_competencia: {
            pessoaId: pessoa.id,
            competencia: data.pagamento.competencia,
          },
        },
        create: {
          pessoaId: pessoa.id,
          competencia: data.pagamento.competencia,
          valor,
          pagoEm: new Date(),
        },
        update: {
          valor,
          pagoEm: new Date(),
        },
      });
    }

    const pedidoAtual = data.pedidoAtual;
    if (pedidoAtual) {
      const ultimo = await tx.pessoaPedido.findFirst({
        where: { pessoaId: pessoa.id },
        orderBy: { createdAt: "desc" },
      });
      if (!ultimo || ultimo.descricao !== pedidoAtual) {
        await tx.pessoaPedido.create({
          data: { pessoaId: pessoa.id, descricao: pedidoAtual },
        });
      }
    }

    return tx.pessoa.findUniqueOrThrow({
      where: { id: pessoa.id },
      include: pessoaInclude,
    });
  });
}

export async function createPessoa(input: unknown) {
  await requireDashboardSession();
  return saveFicha(input);
}

export async function updatePessoa(id: number, input: unknown) {
  await requireDashboardSession();
  return saveFicha(input, id);
}

export async function inactivatePessoa(id: number) {
  await requireDashboardSession();
  return prisma.pessoa.update({
    where: { id },
    data: { inactivatedAt: new Date() },
  });
}

export async function getPessoa(id: number) {
  return prisma.pessoa.findUnique({
    where: { id },
    include: pessoaInclude,
  });
}

export async function listPessoasAtivas(busca?: string) {
  const termo = busca?.trim();

  return prisma.pessoa.findMany({
    where: {
      inactivatedAt: null,
      ...(termo
        ? {
            OR: [
              { nome: { contains: termo, mode: "insensitive" } },
              { cpf: { contains: termo, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: pessoaInclude,
    orderBy: { nome: "asc" },
  });
}

export function proximaCompetencia(maxCompetencia: string | null | undefined) {
  if (!maxCompetencia) return null;
  const [yearStr, monthStr] = maxCompetencia.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) return null;
  const next = new Date(year, month, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

export async function listTiposDocumentoPendentes(pessoaId: number) {
  const rows = await prisma.$queryRaw<{ tipo: string }[]>(Prisma.sql`
    SELECT t.tipo
    FROM (
      VALUES
        ('FICHA_FILIACAO'),
        ('RG_CPF'),
        ('COMP_RESIDENCIA'),
        ('RECEITA_MEDICA'),
        ('LAUDO')
    ) AS t(tipo)
    LEFT JOIN pessoa_documento pd
      ON pd."pessoaId" = ${pessoaId}
     AND pd.tipo::text = t.tipo
    WHERE pd.id IS NULL OR pd.presente = false
  `);

  return rows.map((row) => row.tipo as DocumentoTipo);
}

export async function fichaTemDocumentosPendentes(pessoaId: number) {
  const pendentes = await listTiposDocumentoPendentes(pessoaId);
  return pendentes.length > 0;
}
