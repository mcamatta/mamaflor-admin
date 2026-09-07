import {
  DocumentoTipo,
  OleoPerfil,
  OleoVolume,
  PessoaSexo,
  PessoaStatus,
  PessoaTipo,
  ProdutoTipo,
} from "@src/generated/prisma/enums";

export type FichaSavePayload = {
  nome: string;
  status: PessoaStatus;
  tipo: PessoaTipo;
  cpf: string | null;
  nascimento: string | null;
  sexo: PessoaSexo | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  possuiResponsavel: boolean;
  responsavelNome: string | null;
  responsavelCpf: string | null;
  validadeReceita: string | null;
  pastaFisica: boolean;
  pastaVirtualUrl: string | null;
  condicaoSaude: string | null;
  prescritor: string | null;
  valorTaxa: number | null;
  observacoes: string | null;
  documentos: {
    completos: boolean;
    faltantes?: DocumentoTipo[];
  };
  produtos: {
    tipo: ProdutoTipo;
    perfil: OleoPerfil | null;
    diluicao: number | null;
    volume: OleoVolume | null;
  }[];
  pagamento?: { competencia: string; valor?: number | null };
  pedidoAtual: string | null;
};

export type ProdutoLinha = {
  tipo: ProdutoTipo;
  perfil: OleoPerfil | null;
  diluicao: string;
  volume: OleoVolume | null;
};

export type FichaFormPessoa = {
  id: number;
  status: PessoaStatus;
  tipo: PessoaTipo;
  cpf: string;
  nascimento: string;
  nome: string;
  sexo: PessoaSexo | "";
  email: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  possuiResponsavel: boolean;
  responsavelNome: string;
  responsavelCpf: string;
  validadeReceita: string;
  pastaFisica: boolean;
  pastaVirtualUrl: string;
  condicaoSaude: string;
  prescritor: string;
  valorTaxa: string;
  observacoes: string;
  faltamDocumentos: boolean;
  documentosFaltantes: DocumentoTipo[];
  produtos: ProdutoLinha[];
  ultimoPagamentoCompetencia: string;
  proximoPagamento: string | null;
  ultimoPedido: string | null;
  pedidoAtual: string;
};

type PessoaSource = {
  id: number;
  status: PessoaStatus;
  tipo: PessoaTipo;
  cpf: string | null;
  nascimento: Date | string | null;
  nome: string;
  sexo: PessoaSexo | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  possuiResponsavel: boolean;
  responsavelNome: string | null;
  responsavelCpf: string | null;
  validadeReceita: Date | string | null;
  pastaFisica: boolean;
  pastaVirtualUrl: string | null;
  condicaoSaude: string | null;
  prescritor: string | null;
  valorTaxa: { toString(): string } | number | string | null;
  observacoes: string | null;
  documentos: { tipo: DocumentoTipo; presente: boolean }[];
  produtos: {
    tipo: ProdutoTipo;
    perfil: OleoPerfil | null;
    diluicao: { toString(): string } | number | string | null;
    volume: OleoVolume | null;
  }[];
  pagamentos: { competencia: string }[];
  pedidos: { descricao: string }[];
};

export const FICHA_DOCUMENTO_TIPOS = [
  DocumentoTipo.FICHA_FILIACAO,
  DocumentoTipo.RG_CPF,
  DocumentoTipo.COMP_RESIDENCIA,
  DocumentoTipo.RECEITA_MEDICA,
  DocumentoTipo.LAUDO,
] as const;

function dateToInput(value: Date | string | null | undefined) {
  if (value == null) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function decimalToInput(
  value: { toString(): string } | number | string | null | undefined,
) {
  if (value == null) return "";
  return typeof value === "number" ? String(value) : value.toString();
}

export function proximaCompetenciaFicha(
  maxCompetencia: string | null | undefined,
) {
  if (!maxCompetencia) return null;
  const [yearStr, monthStr] = maxCompetencia.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) return null;
  const next = new Date(year, month, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

export function toFichaFormPessoa(pessoa: PessoaSource): FichaFormPessoa {
  const faltantes = FICHA_DOCUMENTO_TIPOS.filter((tipo) => {
    const row = pessoa.documentos.find((documento) => documento.tipo === tipo);
    return row == null || row.presente === false;
  });

  return {
    id: pessoa.id,
    status: pessoa.status,
    tipo: pessoa.tipo,
    cpf: pessoa.cpf ?? "",
    nascimento: dateToInput(pessoa.nascimento),
    nome: pessoa.nome,
    sexo: pessoa.sexo ?? "",
    email: pessoa.email ?? "",
    telefone: pessoa.telefone ?? "",
    cep: pessoa.cep ?? "",
    rua: pessoa.rua ?? "",
    numero: pessoa.numero ?? "",
    complemento: pessoa.complemento ?? "",
    bairro: pessoa.bairro ?? "",
    cidade: pessoa.cidade ?? "",
    uf: pessoa.uf ?? "",
    possuiResponsavel: pessoa.possuiResponsavel,
    responsavelNome: pessoa.responsavelNome ?? "",
    responsavelCpf: pessoa.responsavelCpf ?? "",
    validadeReceita: dateToInput(pessoa.validadeReceita),
    pastaFisica: pessoa.pastaFisica,
    pastaVirtualUrl: pessoa.pastaVirtualUrl ?? "",
    condicaoSaude: pessoa.condicaoSaude ?? "",
    prescritor: pessoa.prescritor ?? "",
    valorTaxa: decimalToInput(pessoa.valorTaxa),
    observacoes: pessoa.observacoes ?? "",
    faltamDocumentos: faltantes.length > 0,
    documentosFaltantes: [...faltantes],
    produtos: pessoa.produtos.map((produto) => ({
      tipo: produto.tipo,
      perfil: produto.perfil,
      diluicao: decimalToInput(produto.diluicao),
      volume: produto.volume,
    })),
    ultimoPagamentoCompetencia: pessoa.pagamentos[0]?.competencia ?? "",
    proximoPagamento: proximaCompetenciaFicha(
      pessoa.pagamentos[0]?.competencia,
    ),
    ultimoPedido: pessoa.pedidos[1]?.descricao ?? null,
    pedidoAtual: pessoa.pedidos[0]?.descricao ?? "",
  };
}
