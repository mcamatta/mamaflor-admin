import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";

import prisma from "@/lib/prisma";
import {
  DOCUMENTO_TIPOS,
  fichaSaveSchema,
  listTiposDocumentoPendentes,
  saveFicha,
} from "@/lib/pessoas";
import { ProdutoTipo } from "@src/generated/prisma/client";

const TEST_PREFIX = "__teste_ficha_";

function nomeTeste(sufixo: string) {
  return `${TEST_PREFIX}${sufixo}`;
}

async function limparTestes() {
  await prisma.pessoa.deleteMany({
    where: { nome: { startsWith: TEST_PREFIX } },
  });
}

describe("persistência da ficha", () => {
  before(async () => {
    await limparTestes();
  });

  after(async () => {
    await limparTestes();
    await prisma.$disconnect();
  });

  test("nome vazio rejeita; CPF omitido aceito", () => {
    const semNome = fichaSaveSchema.safeParse({ nome: "   " });
    assert.equal(semNome.success, false);

    const semCpf = fichaSaveSchema.safeParse({ nome: "Ana Silva" });
    assert.equal(semCpf.success, true);
    if (semCpf.success) {
      assert.equal(semCpf.data.cpf, null);
    }
  });

  test("óleo sem diluição rejeita; outros tipos e lista vazia passam", () => {
    const oleoSemDiluicao = fichaSaveSchema.safeParse({
      nome: "Ana Silva",
      produtos: [{ tipo: ProdutoTipo.OLEO }],
    });
    assert.equal(oleoSemDiluicao.success, false);

    const pomada = fichaSaveSchema.safeParse({
      nome: "Ana Silva",
      produtos: [{ tipo: ProdutoTipo.POMADA }],
    });
    assert.equal(pomada.success, true);

    const listaVazia = fichaSaveSchema.safeParse({
      nome: "Ana Silva",
      produtos: [],
    });
    assert.equal(listaVazia.success, true);
  });

  test("ficha nova: LEFT JOIN dos 5 tipos implica faltam docs", async () => {
    const pessoa = await saveFicha({ nome: nomeTeste("nova") });
    const pendentes = await listTiposDocumentoPendentes(pessoa.id);
    assert.deepEqual([...pendentes].sort(), [...DOCUMENTO_TIPOS].sort());
  });

  test("completar docs: 5 linhas presente = true implica sem pendência", async () => {
    const pessoa = await saveFicha({ nome: nomeTeste("docs") });
    await saveFicha(
      {
        nome: nomeTeste("docs"),
        documentos: { completos: true },
      },
      pessoa.id,
    );
    const pendentes = await listTiposDocumentoPendentes(pessoa.id);
    assert.equal(pendentes.length, 0);

    const linhas = await prisma.pessoaDocumento.findMany({
      where: { pessoaId: pessoa.id },
    });
    assert.equal(linhas.length, 5);
    assert.ok(linhas.every((linha) => linha.presente));
  });

  test("segundo pagamento / segundo pedido não apaga o anterior", async () => {
    const pessoa = await saveFicha({
      nome: nomeTeste("historico"),
      valorTaxa: 80,
      pagamento: { competencia: "2026-01" },
      pedidoAtual: "Pedido um",
    });

    await saveFicha(
      {
        nome: nomeTeste("historico"),
        valorTaxa: 80,
        pagamento: { competencia: "2026-02" },
        pedidoAtual: "Pedido dois",
      },
      pessoa.id,
    );

    const pagamentos = await prisma.pessoaPagamento.findMany({
      where: { pessoaId: pessoa.id },
      orderBy: { competencia: "asc" },
    });
    assert.deepEqual(
      pagamentos.map((pagamento) => pagamento.competencia),
      ["2026-01", "2026-02"],
    );

    const pedidos = await prisma.pessoaPedido.findMany({
      where: { pessoaId: pessoa.id },
      orderBy: { createdAt: "asc" },
    });
    assert.equal(pedidos.length, 2);
    assert.equal(pedidos[0]?.descricao, "Pedido um");
    assert.equal(pedidos[1]?.descricao, "Pedido dois");
  });
});
