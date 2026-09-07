"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FICHA_DOCUMENTO_TIPOS,
  type FichaFormPessoa,
  type FichaSavePayload,
  type ProdutoLinha,
  proximaCompetenciaFicha,
} from "@/components/pessoas/ficha-data";
import { cn } from "@/lib/utils";
import {
  DocumentoTipo,
  OleoPerfil,
  OleoVolume,
  PessoaSexo,
  PessoaStatus,
  PessoaTipo,
  ProdutoTipo,
} from "@src/generated/prisma/browser";

export type FichaFormMode = "create" | "edit" | "view";
export type { FichaFormPessoa, FichaSavePayload };

const STATUS_LABEL: Record<PessoaStatus, string> = {
  [PessoaStatus.EM_DIA]: "Em dia/Renovou",
  [PessoaStatus.PRE_ASSOCIADO]: "Pré associado",
  [PessoaStatus.DOCUMENTACAO_OK]: "Documentação OK",
  [PessoaStatus.ATENCAO]: "Atenção vencimento/documento",
  [PessoaStatus.ISENTO]: "Isento",
  [PessoaStatus.SAIU]: "Saiu da associação",
};

const TIPO_LABEL: Record<PessoaTipo, string> = {
  [PessoaTipo.HUMANO]: "Humano",
  [PessoaTipo.PET]: "Pet",
};

const SEXO_LABEL: Record<PessoaSexo, string> = {
  [PessoaSexo.M]: "M",
  [PessoaSexo.F]: "F",
  [PessoaSexo.OUTRO]: "Outro",
};

const DOCUMENTO_LABEL: Record<DocumentoTipo, string> = {
  [DocumentoTipo.FICHA_FILIACAO]: "Ficha de filiação",
  [DocumentoTipo.RG_CPF]: "RG/CPF",
  [DocumentoTipo.COMP_RESIDENCIA]: "Comp. residência",
  [DocumentoTipo.RECEITA_MEDICA]: "Receita médica",
  [DocumentoTipo.LAUDO]: "Laudo/relatório",
};

const PRODUTO_LABEL: Record<ProdutoTipo, string> = {
  [ProdutoTipo.OLEO]: "Óleo",
  [ProdutoTipo.POMADA]: "Pomada",
  [ProdutoTipo.RESINA]: "Resina (Seringa)",
  [ProdutoTipo.RESGATE]: "Resgate (Spray)",
  [ProdutoTipo.SUPOSITORIO]: "Supositório",
  [ProdutoTipo.FLORES]: "Flores in Natura",
};

const PERFIL_LABEL: Record<OleoPerfil, string> = {
  [OleoPerfil.FULL_SPECTRUM]: "Full Spectrum",
  [OleoPerfil.BROAD_SPECTRUM]: "Broad Spectrum",
  [OleoPerfil.ISOLADO]: "Isolado",
};

const VOLUME_LABEL: Record<OleoVolume, string> = {
  [OleoVolume.ML_10]: "10ml",
  [OleoVolume.ML_30]: "30ml",
};

const textareaClassName = cn(
  "border-input placeholder:text-muted-foreground dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
);

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim().replace(",", ".");
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function cepDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function FichaForm({
  action,
  mode,
  pessoa,
}: {
  action?: (payload: FichaSavePayload) => Promise<{ id: number }>;
  mode: FichaFormMode;
  pessoa?: FichaFormPessoa;
}) {
  const router = useRouter();
  const readOnly = mode === "view";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<PessoaStatus>(
    pessoa?.status ?? PessoaStatus.EM_DIA,
  );
  const [tipo, setTipo] = useState<PessoaTipo>(
    pessoa?.tipo ?? PessoaTipo.HUMANO,
  );
  const [cpf, setCpf] = useState(pessoa?.cpf ?? "");
  const [nascimento, setNascimento] = useState(pessoa?.nascimento ?? "");
  const [nome, setNome] = useState(pessoa?.nome ?? "");
  const [sexo, setSexo] = useState<PessoaSexo | "">(pessoa?.sexo ?? "");
  const [email, setEmail] = useState(pessoa?.email ?? "");
  const [telefone, setTelefone] = useState(pessoa?.telefone ?? "");
  const [cep, setCep] = useState(pessoa?.cep ?? "");
  const [rua, setRua] = useState(pessoa?.rua ?? "");
  const [numero, setNumero] = useState(pessoa?.numero ?? "");
  const [complemento, setComplemento] = useState(pessoa?.complemento ?? "");
  const [bairro, setBairro] = useState(pessoa?.bairro ?? "");
  const [cidade, setCidade] = useState(pessoa?.cidade ?? "");
  const [uf, setUf] = useState(pessoa?.uf ?? "");
  const [possuiResponsavel, setPossuiResponsavel] = useState(
    pessoa?.possuiResponsavel ?? false,
  );
  const [responsavelNome, setResponsavelNome] = useState(
    pessoa?.responsavelNome ?? "",
  );
  const [responsavelCpf, setResponsavelCpf] = useState(
    pessoa?.responsavelCpf ?? "",
  );
  const [validadeReceita, setValidadeReceita] = useState(
    pessoa?.validadeReceita ?? "",
  );
  const [pastaFisica, setPastaFisica] = useState(pessoa?.pastaFisica ?? false);
  const [pastaVirtualUrl, setPastaVirtualUrl] = useState(
    pessoa?.pastaVirtualUrl ?? "",
  );
  const [faltamDocumentos, setFaltamDocumentos] = useState(
    pessoa?.faltamDocumentos ?? true,
  );
  const [documentosFaltantes, setDocumentosFaltantes] = useState<
    DocumentoTipo[]
  >(pessoa?.documentosFaltantes ?? [...FICHA_DOCUMENTO_TIPOS]);
  const [condicaoSaude, setCondicaoSaude] = useState(
    pessoa?.condicaoSaude ?? "",
  );
  const [prescritor, setPrescritor] = useState(pessoa?.prescritor ?? "");
  const [produtos, setProdutos] = useState<ProdutoLinha[]>(
    pessoa?.produtos ?? [],
  );
  const [novoTipo, setNovoTipo] = useState<ProdutoTipo>(ProdutoTipo.OLEO);
  const [novoPerfil, setNovoPerfil] = useState<OleoPerfil | "">("");
  const [novaDiluicao, setNovaDiluicao] = useState("");
  const [novoVolume, setNovoVolume] = useState<OleoVolume | "">("");
  const [valorTaxa, setValorTaxa] = useState(pessoa?.valorTaxa ?? "");
  const [ultimoPagamentoCompetencia, setUltimoPagamentoCompetencia] = useState(
    pessoa?.ultimoPagamentoCompetencia ?? "",
  );
  const [pedidoAtual, setPedidoAtual] = useState(pessoa?.pedidoAtual ?? "");
  const [observacoes, setObservacoes] = useState(pessoa?.observacoes ?? "");

  const proximoPagamento = useMemo(
    () =>
      proximaCompetenciaFicha(ultimoPagamentoCompetencia) ??
      pessoa?.proximoPagamento ??
      null,
    [ultimoPagamentoCompetencia, pessoa?.proximoPagamento],
  );

  useEffect(() => {
    if (readOnly) return;
    const digits = cepDigits(cep);
    if (digits.length !== 8) return;

    let cancelled = false;
    fetch(`https://viacep.com.br/ws/${digits}/json/`)
      .then((response) => response.json())
      .then(
        (data: {
          erro?: boolean | string;
          logradouro?: string;
          bairro?: string;
          localidade?: string;
          uf?: string;
        }) => {
          if (cancelled || data.erro) return;
          setRua(data.logradouro ?? "");
          setBairro(data.bairro ?? "");
          setCidade(data.localidade ?? "");
          setUf(data.uf ?? "");
        },
      )
      .catch(() => {
        /* endereço permanece manual */
      });

    return () => {
      cancelled = true;
    };
  }, [cep, readOnly]);

  function handleTipoChange(next: PessoaTipo) {
    setTipo(next);
    if (next === PessoaTipo.PET) {
      setPossuiResponsavel(true);
    }
  }

  function toggleDocumento(tipoDoc: DocumentoTipo, checked: boolean) {
    setDocumentosFaltantes((current) => {
      if (checked) {
        return current.includes(tipoDoc) ? current : [...current, tipoDoc];
      }
      return current.filter((item) => item !== tipoDoc);
    });
  }

  function adicionarProduto() {
    if (novoTipo === ProdutoTipo.OLEO && parseOptionalNumber(novaDiluicao) == null) {
      setError("Diluição é obrigatória para incluir óleo.");
      return;
    }

    setError(null);
    setProdutos((current) => [
      ...current,
      {
        tipo: novoTipo,
        perfil: novoTipo === ProdutoTipo.OLEO ? (novoPerfil || null) : null,
        diluicao: novoTipo === ProdutoTipo.OLEO ? novaDiluicao : "",
        volume: novoTipo === ProdutoTipo.OLEO ? (novoVolume || null) : null,
      },
    ]);
    setNovoPerfil("");
    setNovaDiluicao("");
    setNovoVolume("");
  }

  function abrirPasta() {
    const url = pastaVirtualUrl.trim();
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readOnly || !action) return;

    if (!nome.trim()) {
      setError("Nome completo é obrigatório.");
      return;
    }

    if (produtos.length === 0) {
      const ok = window.confirm(
        "A lista de produtos está vazia. Salvar a ficha mesmo assim?",
      );
      if (!ok) return;
    }

    const payload: FichaSavePayload = {
      nome: nome.trim(),
      status,
      tipo,
      cpf: emptyToNull(cpf),
      nascimento: emptyToNull(nascimento),
      sexo: sexo || null,
      email: emptyToNull(email),
      telefone: emptyToNull(telefone),
      cep: emptyToNull(cep),
      rua: emptyToNull(rua),
      numero: emptyToNull(numero),
      complemento: emptyToNull(complemento),
      bairro: emptyToNull(bairro),
      cidade: emptyToNull(cidade),
      uf: emptyToNull(uf),
      possuiResponsavel,
      responsavelNome: emptyToNull(responsavelNome),
      responsavelCpf: emptyToNull(responsavelCpf),
      validadeReceita: emptyToNull(validadeReceita),
      pastaFisica,
      pastaVirtualUrl: emptyToNull(pastaVirtualUrl),
      condicaoSaude: emptyToNull(condicaoSaude),
      prescritor: emptyToNull(prescritor),
      valorTaxa: parseOptionalNumber(valorTaxa),
      observacoes: emptyToNull(observacoes),
      documentos: faltamDocumentos
        ? { completos: false, faltantes: documentosFaltantes }
        : { completos: true },
      produtos: produtos.map((produto) => ({
        tipo: produto.tipo,
        perfil: produto.tipo === ProdutoTipo.OLEO ? produto.perfil : null,
        diluicao:
          produto.tipo === ProdutoTipo.OLEO
            ? parseOptionalNumber(produto.diluicao)
            : null,
        volume: produto.tipo === ProdutoTipo.OLEO ? produto.volume : null,
      })),
      pagamento: /^\d{4}-\d{2}$/.test(ultimoPagamentoCompetencia)
        ? { competencia: ultimoPagamentoCompetencia }
        : undefined,
      pedidoAtual: emptyToNull(pedidoAtual),
    };

    setError(null);
    startTransition(async () => {
      try {
        const saved = await action(payload);
        router.push(`/dashboard/pessoas/${saved.id}`);
        router.refresh();
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível salvar a ficha.",
        );
      }
    });
  }

  const titulo =
    mode === "create"
      ? "Nova pessoa"
      : mode === "edit"
        ? "Editar ficha"
        : "Ficha";

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <p className="text-muted-foreground text-sm">
            {mode === "create"
              ? "Preencha os cinco blocos da ficha. Só o nome completo é obrigatório."
              : "ID do associado identifica a pasta no OneDrive."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/pessoas">Voltar</Link>
          </Button>
          {pessoa ? (
            mode === "view" ? (
              <Button asChild>
                <Link href={`/dashboard/pessoas/${pessoa.id}/editar`}>
                  Editar
                </Link>
              </Button>
            ) : (
              <Button asChild variant="secondary">
                <Link href={`/dashboard/pessoas/${pessoa.id}`}>Ver</Link>
              </Button>
            )
          ) : null}
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Identificação e contato</CardTitle>
          <CardDescription>
            O ID é o mesmo usado na pasta do OneDrive.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>ID do associado</Label>
            <div className="flex h-9 items-center">
              {pessoa ? (
                <Badge variant="secondary">#{pessoa.id}</Badge>
              ) : (
                <span className="text-muted-foreground text-sm">
                  Será gerado ao salvar
                </span>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              disabled={readOnly}
              onValueChange={(value) => setStatus(value as PessoaStatus)}
              value={status}
            >
              <SelectTrigger className="w-full" id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PessoaStatus).map((value) => (
                  <SelectItem key={value} value={value}>
                    {STATUS_LABEL[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              disabled={readOnly}
              onValueChange={(value) => handleTipoChange(value as PessoaTipo)}
              value={tipo}
            >
              <SelectTrigger className="w-full" id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PessoaTipo).map((value) => (
                  <SelectItem key={value} value={value}>
                    {TIPO_LABEL[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              disabled={readOnly}
              id="cpf"
              onChange={(event) => setCpf(event.target.value)}
              value={cpf}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nascimento">Nascimento</Label>
            <Input
              disabled={readOnly}
              id="nascimento"
              onChange={(event) => setNascimento(event.target.value)}
              type="date"
              value={nascimento}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              disabled={readOnly}
              id="nome"
              onChange={(event) => setNome(event.target.value)}
              required
              value={nome}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sexo">Sexo</Label>
            <Select
              disabled={readOnly}
              onValueChange={(value) =>
                setSexo(value === "none" ? "" : (value as PessoaSexo))
              }
              value={sexo || "none"}
            >
              <SelectTrigger className="w-full" id="sexo">
                <SelectValue placeholder="Não informado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não informado</SelectItem>
                {Object.values(PessoaSexo).map((value) => (
                  <SelectItem key={value} value={value}>
                    {SEXO_LABEL[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              disabled={readOnly}
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="telefone">Telefone/WhatsApp</Label>
            <Input
              disabled={readOnly}
              id="telefone"
              onChange={(event) => setTelefone(event.target.value)}
              value={telefone}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              disabled={readOnly}
              id="cep"
              inputMode="numeric"
              onChange={(event) => setCep(event.target.value)}
              value={cep}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="uf">UF</Label>
            <Input
              disabled={readOnly}
              id="uf"
              maxLength={2}
              onChange={(event) => setUf(event.target.value.toUpperCase())}
              value={uf}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="rua">Rua</Label>
            <Input
              disabled={readOnly}
              id="rua"
              onChange={(event) => setRua(event.target.value)}
              value={rua}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="numero">Número</Label>
            <Input
              disabled={readOnly}
              id="numero"
              onChange={(event) => setNumero(event.target.value)}
              value={numero}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              disabled={readOnly}
              id="complemento"
              onChange={(event) => setComplemento(event.target.value)}
              value={complemento}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              disabled={readOnly}
              id="bairro"
              onChange={(event) => setBairro(event.target.value)}
              value={bairro}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              disabled={readOnly}
              id="cidade"
              onChange={(event) => setCidade(event.target.value)}
              value={cidade}
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox
              checked={possuiResponsavel}
              disabled={readOnly}
              id="possuiResponsavel"
              onCheckedChange={(checked) =>
                setPossuiResponsavel(checked === true)
              }
            />
            <Label htmlFor="possuiResponsavel">Possui responsável legal</Label>
          </div>
          {possuiResponsavel ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="responsavelNome">Nome do responsável</Label>
                <Input
                  disabled={readOnly}
                  id="responsavelNome"
                  onChange={(event) => setResponsavelNome(event.target.value)}
                  value={responsavelNome}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="responsavelCpf">CPF do responsável</Label>
                <Input
                  disabled={readOnly}
                  id="responsavelCpf"
                  onChange={(event) => setResponsavelCpf(event.target.value)}
                  value={responsavelCpf}
                />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentação e pastas</CardTitle>
          <CardDescription>
            Pasta virtual é o link da pasta OneDrive deste ID — sem upload.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="faltamDocumentos">Faltam documentos</Label>
            <Select
              disabled={readOnly}
              onValueChange={(value) => setFaltamDocumentos(value === "sim")}
              value={faltamDocumentos ? "sim" : "nao"}
            >
              <SelectTrigger className="w-full" id="faltamDocumentos">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não (completa)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="validadeReceita">Validade da receita</Label>
            <Input
              disabled={readOnly}
              id="validadeReceita"
              onChange={(event) => setValidadeReceita(event.target.value)}
              type="date"
              value={validadeReceita}
            />
          </div>
          {faltamDocumentos ? (
            <div className="grid gap-2 sm:col-span-2">
              <Label>O que falta</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {FICHA_DOCUMENTO_TIPOS.map((tipoDoc) => (
                  <label
                    className="flex items-center gap-2 text-sm"
                    htmlFor={`doc-${tipoDoc}`}
                    key={tipoDoc}
                  >
                    <Checkbox
                      checked={documentosFaltantes.includes(tipoDoc)}
                      disabled={readOnly}
                      id={`doc-${tipoDoc}`}
                      onCheckedChange={(checked) =>
                        toggleDocumento(tipoDoc, checked === true)
                      }
                    />
                    {DOCUMENTO_LABEL[tipoDoc]}
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox
              checked={pastaFisica}
              disabled={readOnly}
              id="pastaFisica"
              onCheckedChange={(checked) => setPastaFisica(checked === true)}
            />
            <Label htmlFor="pastaFisica">Pasta física criada</Label>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="pastaVirtualUrl">Pasta virtual (OneDrive)</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                disabled={readOnly}
                id="pastaVirtualUrl"
                onChange={(event) => setPastaVirtualUrl(event.target.value)}
                placeholder="https://..."
                value={pastaVirtualUrl}
              />
              <Button
                disabled={!pastaVirtualUrl.trim()}
                onClick={abrirPasta}
                type="button"
                variant="secondary"
              >
                Abrir pasta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tratamento e produtos</CardTitle>
          <CardDescription>
            Produtos são opcionais. Óleo exige diluição. Lista vazia pede
            confirmação ao salvar.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="condicaoSaude">Condição de saúde</Label>
              <textarea
                className={textareaClassName}
                disabled={readOnly}
                id="condicaoSaude"
                onChange={(event) => setCondicaoSaude(event.target.value)}
                value={condicaoSaude}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="prescritor">Profissional prescritor</Label>
              <Input
                disabled={readOnly}
                id="prescritor"
                onChange={(event) => setPrescritor(event.target.value)}
                value={prescritor}
              />
            </div>
          </div>

          {!readOnly ? (
            <div className="grid gap-3 rounded-lg border p-4">
              <p className="text-sm font-medium">Incluir produto</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-2">
                  <Label htmlFor="novoTipo">Tipo</Label>
                  <Select
                    onValueChange={(value) => setNovoTipo(value as ProdutoTipo)}
                    value={novoTipo}
                  >
                    <SelectTrigger className="w-full" id="novoTipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ProdutoTipo).map((value) => (
                        <SelectItem key={value} value={value}>
                          {PRODUTO_LABEL[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {novoTipo === ProdutoTipo.OLEO ? (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="novoPerfil">Perfil</Label>
                      <Select
                        onValueChange={(value) =>
                          setNovoPerfil(
                            value === "none" ? "" : (value as OleoPerfil),
                          )
                        }
                        value={novoPerfil || "none"}
                      >
                        <SelectTrigger className="w-full" id="novoPerfil">
                          <SelectValue placeholder="Perfil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Não informado</SelectItem>
                          {Object.values(OleoPerfil).map((value) => (
                            <SelectItem key={value} value={value}>
                              {PERFIL_LABEL[value]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="novaDiluicao">Diluição %</Label>
                      <Input
                        id="novaDiluicao"
                        inputMode="decimal"
                        onChange={(event) => setNovaDiluicao(event.target.value)}
                        value={novaDiluicao}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="novoVolume">Volume</Label>
                      <Select
                        onValueChange={(value) =>
                          setNovoVolume(
                            value === "none" ? "" : (value as OleoVolume),
                          )
                        }
                        value={novoVolume || "none"}
                      >
                        <SelectTrigger className="w-full" id="novoVolume">
                          <SelectValue placeholder="Volume" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Não informado</SelectItem>
                          {Object.values(OleoVolume).map((value) => (
                            <SelectItem key={value} value={value}>
                              {VOLUME_LABEL[value]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : null}
              </div>
              <div>
                <Button onClick={adicionarProduto} type="button" variant="secondary">
                  Incluir produto
                </Button>
              </div>
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalhes</TableHead>
                {!readOnly ? (
                  <TableHead className="text-right">Ações</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="text-muted-foreground"
                    colSpan={readOnly ? 2 : 3}
                  >
                    Nenhum produto na ficha.
                  </TableCell>
                </TableRow>
              ) : (
                produtos.map((produto, index) => (
                  <TableRow key={`${produto.tipo}-${index}`}>
                    <TableCell>{PRODUTO_LABEL[produto.tipo]}</TableCell>
                    <TableCell className="whitespace-normal">
                      {produto.tipo === ProdutoTipo.OLEO
                        ? [
                            produto.perfil
                              ? PERFIL_LABEL[produto.perfil]
                              : null,
                            produto.diluicao
                              ? `Diluição ${produto.diluicao}%`
                              : null,
                            produto.volume
                              ? VOLUME_LABEL[produto.volume]
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "—"
                        : "—"}
                    </TableCell>
                    {!readOnly ? (
                      <TableCell className="text-right">
                        <Button
                          onClick={() =>
                            setProdutos((current) =>
                              current.filter((_, i) => i !== index),
                            )
                          }
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Remover
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financeiro e pedidos</CardTitle>
          <CardDescription>
            Próximo pagamento é derivado. Último pedido é só leitura; pedido
            atual grava um novo registro se o texto mudar.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="valorTaxa">Taxa vigente</Label>
            <Input
              disabled={readOnly}
              id="valorTaxa"
              inputMode="decimal"
              onChange={(event) => setValorTaxa(event.target.value)}
              value={valorTaxa}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ultimoPagamento">Último pagamento</Label>
            <Input
              disabled={readOnly}
              id="ultimoPagamento"
              onChange={(event) =>
                setUltimoPagamentoCompetencia(event.target.value)
              }
              type="month"
              value={ultimoPagamentoCompetencia}
            />
          </div>
          <div className="grid gap-2">
            <Label>Próximo pagamento</Label>
            <Input disabled readOnly value={proximoPagamento ?? "—"} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Último pedido</Label>
            <textarea
              className={textareaClassName}
              disabled
              readOnly
              value={pessoa?.ultimoPedido ?? ""}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="pedidoAtual">Pedido atual</Label>
            <textarea
              className={textareaClassName}
              disabled={readOnly}
              id="pedidoAtual"
              onChange={(event) => setPedidoAtual(event.target.value)}
              value={pedidoAtual}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className={textareaClassName}
            disabled={readOnly}
            id="observacoes"
            onChange={(event) => setObservacoes(event.target.value)}
            value={observacoes}
          />
        </CardContent>
      </Card>

      {!readOnly ? (
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/pessoas">Cancelar</Link>
          </Button>
          <Button disabled={pending} type="submit">
            {pending ? "Salvando..." : "Salvar ficha"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
