-- CreateEnum
CREATE TYPE "PessoaStatus" AS ENUM ('EM_DIA', 'PRE_ASSOCIADO', 'DOCUMENTACAO_OK', 'ATENCAO', 'ISENTO', 'SAIU');

-- CreateEnum
CREATE TYPE "PessoaTipo" AS ENUM ('HUMANO', 'PET');

-- CreateEnum
CREATE TYPE "PessoaSexo" AS ENUM ('M', 'F', 'OUTRO');

-- CreateEnum
CREATE TYPE "DocumentoTipo" AS ENUM ('FICHA_FILIACAO', 'RG_CPF', 'COMP_RESIDENCIA', 'RECEITA_MEDICA', 'LAUDO');

-- CreateEnum
CREATE TYPE "ProdutoTipo" AS ENUM ('OLEO', 'POMADA', 'RESINA', 'RESGATE', 'SUPOSITORIO', 'FLORES');

-- CreateEnum
CREATE TYPE "OleoPerfil" AS ENUM ('FULL_SPECTRUM', 'BROAD_SPECTRUM', 'ISOLADO');

-- CreateEnum
CREATE TYPE "OleoVolume" AS ENUM ('ML_10', 'ML_30');

-- CreateTable
CREATE TABLE "pessoa" (
    "id" SERIAL NOT NULL,
    "status" "PessoaStatus" NOT NULL DEFAULT 'EM_DIA',
    "tipo" "PessoaTipo" NOT NULL DEFAULT 'HUMANO',
    "cpf" TEXT,
    "nascimento" DATE,
    "nome" TEXT NOT NULL,
    "sexo" "PessoaSexo",
    "email" TEXT,
    "telefone" TEXT,
    "cep" TEXT,
    "rua" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" VARCHAR(2),
    "possuiResponsavel" BOOLEAN NOT NULL DEFAULT false,
    "responsavelNome" TEXT,
    "responsavelCpf" TEXT,
    "validadeReceita" DATE,
    "pastaFisica" BOOLEAN NOT NULL DEFAULT false,
    "pastaVirtualUrl" TEXT,
    "condicaoSaude" TEXT,
    "prescritor" TEXT,
    "valorTaxa" DECIMAL(10,2),
    "observacoes" TEXT,
    "inactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pessoa_documento" (
    "id" SERIAL NOT NULL,
    "pessoaId" INTEGER NOT NULL,
    "tipo" "DocumentoTipo" NOT NULL,
    "presente" BOOLEAN NOT NULL,

    CONSTRAINT "pessoa_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pessoa_produto" (
    "id" SERIAL NOT NULL,
    "pessoaId" INTEGER NOT NULL,
    "tipo" "ProdutoTipo" NOT NULL,
    "perfil" "OleoPerfil",
    "diluicao" DECIMAL(65,30),
    "volume" "OleoVolume",

    CONSTRAINT "pessoa_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pessoa_pagamento" (
    "id" SERIAL NOT NULL,
    "pessoaId" INTEGER NOT NULL,
    "competencia" TEXT NOT NULL,
    "valor" DECIMAL(10,2),
    "pagoEm" TIMESTAMP(3),

    CONSTRAINT "pessoa_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pessoa_pedido" (
    "id" SERIAL NOT NULL,
    "pessoaId" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pessoa_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pessoa_inactivatedAt_idx" ON "pessoa"("inactivatedAt");

-- CreateIndex
CREATE INDEX "pessoa_nome_idx" ON "pessoa"("nome");

-- CreateIndex
CREATE INDEX "pessoa_cpf_idx" ON "pessoa"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "pessoa_documento_pessoaId_tipo_key" ON "pessoa_documento"("pessoaId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "pessoa_pagamento_pessoaId_competencia_key" ON "pessoa_pagamento"("pessoaId", "competencia");

-- AddForeignKey
ALTER TABLE "pessoa_documento" ADD CONSTRAINT "pessoa_documento_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pessoa_produto" ADD CONSTRAINT "pessoa_produto_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pessoa_pagamento" ADD CONSTRAINT "pessoa_pagamento_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pessoa_pedido" ADD CONSTRAINT "pessoa_pedido_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
