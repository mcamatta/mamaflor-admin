import Link from "next/link";
import { revalidatePath } from "next/cache";

import { InativarPessoaButton } from "./inativar-pessoa-button";
import { Badge } from "@/components/ui/badge";
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
import {
  DOCUMENTO_TIPOS,
  inactivatePessoa,
  listPessoasAtivas,
  proximaCompetencia,
} from "@/lib/pessoas";
import {
  PessoaStatus,
  PessoaTipo,
  ProdutoTipo,
} from "@src/generated/prisma/client";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const STATUS_LABEL: Record<PessoaStatus, string> = {
  [PessoaStatus.EM_DIA]: "Em dia/Renovou",
  [PessoaStatus.PRE_ASSOCIADO]: "Pré associado",
  [PessoaStatus.DOCUMENTACAO_OK]: "Documentação OK",
  [PessoaStatus.ATENCAO]: "Atenção",
  [PessoaStatus.ISENTO]: "Isento",
  [PessoaStatus.SAIU]: "Saiu da associação",
};

const TIPO_LABEL: Record<PessoaTipo, string> = {
  [PessoaTipo.HUMANO]: "Humano",
  [PessoaTipo.PET]: "Pet",
};

const PRODUTO_LABEL: Record<ProdutoTipo, string> = {
  [ProdutoTipo.OLEO]: "Óleo",
  [ProdutoTipo.POMADA]: "Pomada",
  [ProdutoTipo.RESINA]: "Resina (Seringa)",
  [ProdutoTipo.RESGATE]: "Resgate (Spray)",
  [ProdutoTipo.SUPOSITORIO]: "Supositório",
  [ProdutoTipo.FLORES]: "Flores in Natura",
};

function statusBadgeVariant(status: PessoaStatus): BadgeVariant {
  if (status === PessoaStatus.ISENTO) return "default";
  if (status === PessoaStatus.ATENCAO) return "destructive";
  if (status === PessoaStatus.SAIU) return "outline";
  return "secondary";
}

function docsPendentes(
  documentos: { tipo: (typeof DOCUMENTO_TIPOS)[number]; presente: boolean }[],
) {
  return DOCUMENTO_TIPOS.some((tipo) => {
    const row = documentos.find((documento) => documento.tipo === tipo);
    return row == null || row.presente === false;
  });
}

function resumoProdutos(
  produtos: { tipo: ProdutoTipo; diluicao: { toString(): string } | null }[],
) {
  if (produtos.length === 0) return "—";
  return produtos
    .map((produto) => {
      const label = PRODUTO_LABEL[produto.tipo];
      if (produto.tipo === ProdutoTipo.OLEO && produto.diluicao != null) {
        return `${label} ${Number(produto.diluicao)}%`;
      }
      return label;
    })
    .join(", ");
}

function formatTaxa(valor: { toString(): string } | null) {
  if (valor == null) return "—";
  const n = Number(valor);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

function isoDateParts(value: Date | string | null | undefined) {
  if (value == null) return null;
  const iso = typeof value === "string" ? value : value.toISOString();
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  return { year: match[1], month: match[2], day: match[3] };
}

function formatAniversario(value: Date | string | null | undefined) {
  const parts = isoDateParts(value);
  if (!parts) return "—";
  return `${parts.day}/${parts.month}/${parts.year}`;
}

function formatVencimento(competencia: string | null | undefined) {
  if (!competencia) return "—";
  const [year, month] = competencia.split("-");
  if (!year || !month) return "—";
  return `${month}/${year}`;
}

function queryString(value: string | string[] | undefined) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

async function inactivatePessoaAction(id: number) {
  "use server";
  await inactivatePessoa(id);
  revalidatePath("/dashboard/pessoas");
}

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const busca = queryString(params.q);
  const pessoas = await listPessoasAtivas(busca || undefined);

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="grid gap-1.5">
              <CardTitle>Associados ativos</CardTitle>
              <CardDescription>
                Busque por nome ou CPF. Inativar remove da lista e preserva o
                histórico.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/pessoas/nova">Nova pessoa</Link>
            </Button>
          </div>
          <form
            action="/dashboard/pessoas"
            className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-end"
            method="get"
          >
            <div className="grid flex-1 gap-2">
              <Label htmlFor="q">Buscar</Label>
              <Input
                defaultValue={busca}
                id="q"
                name="q"
                placeholder="Nome ou CPF"
              />
            </div>
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </form>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Aniversário</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Docs</TableHead>
                <TableHead>Financeiro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pessoas.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="text-muted-foreground whitespace-normal"
                    colSpan={9}
                  >
                    Nenhum associado ativo encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                pessoas.map((pessoa) => {
                  const pendente = docsPendentes(pessoa.documentos);
                  const proximo = proximaCompetencia(
                    pessoa.pagamentos[0]?.competencia,
                  );

                  return (
                    <TableRow key={pessoa.id}>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(pessoa.status)}>
                          {STATUS_LABEL[pessoa.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="font-medium">{pessoa.nome}</div>
                        <div className="text-muted-foreground text-xs">
                          #{pessoa.id} · {TIPO_LABEL[pessoa.tipo]}
                          {pessoa.cpf ? ` · CPF ${pessoa.cpf}` : ""}
                        </div>
                      </TableCell>
                      <TableCell>{formatAniversario(pessoa.nascimento)}</TableCell>
                      <TableCell>{formatVencimento(proximo)}</TableCell>
                      <TableCell className="whitespace-normal">
                        <div>{pessoa.telefone ?? "—"}</div>
                        <div className="text-muted-foreground text-xs">
                          {pessoa.email ?? "—"}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {resumoProdutos(pessoa.produtos)}
                      </TableCell>
                      <TableCell>
                        {pendente ? "Pendente" : "Completo"}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {formatTaxa(pessoa.valorTaxa)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/dashboard/pessoas/${pessoa.id}`}>
                              Ver
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="ghost">
                            <Link
                              href={`/dashboard/pessoas/${pessoa.id}/editar`}
                            >
                              Editar
                            </Link>
                          </Button>
                          <InativarPessoaButton
                            action={inactivatePessoaAction.bind(null, pessoa.id)}
                            nome={pessoa.nome}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
