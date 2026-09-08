import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  UsuarioError,
  createUsuario,
  listUsuarios,
  removeUsuario,
  updateUsuario,
  usuarioCreateSchema,
} from "@/lib/usuarios";

const TEST_PREFIX = "__teste_usuario_";
const TEST_PASSWORD = "senha-de-teste";

function emailTeste(sufixo: string) {
  return `${TEST_PREFIX}${sufixo}@example.test`;
}

async function limparTestes() {
  await prisma.user.deleteMany({
    where: { email: { startsWith: TEST_PREFIX } },
  });
}

async function headersAutenticados(email: string) {
  const response = await auth.api.signInEmail({
    body: { email, password: TEST_PASSWORD },
    asResponse: true,
  });
  const cookies = response.headers.getSetCookie();
  assert.ok(cookies.length > 0, "o login deve criar uma sessão");
  return new Headers({ cookie: cookies.map((cookie) => cookie.split(";")[0]).join("; ") });
}

async function criarAdministrador(sufixo: string) {
  const email = emailTeste(sufixo);
  const result = await auth.api.createUser({
    body: { name: `${TEST_PREFIX}${sufixo}`, email, password: TEST_PASSWORD },
  });
  return { id: result.user.id, email, headers: await headersAutenticados(email) };
}

describe("usuários", () => {
  before(async () => {
    await limparTestes();
  });

  after(async () => {
    await limparTestes();
    await prisma.$disconnect();
  });

  test("valida nome, e-mail e senha e normaliza o e-mail", () => {
    assert.equal(usuarioCreateSchema.safeParse({ email: emailTeste("x"), senha: TEST_PASSWORD }).success, false);
    assert.equal(usuarioCreateSchema.safeParse({ nome: "Ana", email: "inválido", senha: TEST_PASSWORD }).success, false);
    assert.equal(usuarioCreateSchema.safeParse({ nome: "Ana", email: emailTeste("x"), senha: "curta" }).success, false);

    const result = usuarioCreateSchema.parse({
      nome: "  Ana  ",
      email: `  ${emailTeste("NORMALIZADO").toUpperCase()}  `,
      senha: TEST_PASSWORD,
    });
    assert.equal(result.nome, "Ana");
    assert.equal(result.email, emailTeste("normalizado"));
  });

  test("busca por nome e e-mail sem expor credenciais", async () => {
    await auth.api.createUser({
      body: { name: `${TEST_PREFIX}Maria`, email: emailTeste("maria"), password: TEST_PASSWORD },
    });

    const porNome = await listUsuarios("mArIa");
    const porEmail = await listUsuarios(emailTeste("maria").toUpperCase());
    const vazio = await listUsuarios("sem-correspondencia");

    assert.equal(porNome.length, 1);
    assert.equal(porEmail.length, 1);
    assert.equal(vazio.length, 0);
    assert.deepEqual(Object.keys(porNome[0]!).sort(), ["createdAt", "email", "id", "name", "updatedAt"]);
  });

  test("cria, edita e remove uma conta autenticada junto das sessões", async () => {
    const administrador = await criarAdministrador("administrador");
    const criado = await createUsuario(
      { nome: `${TEST_PREFIX}Alvo`, email: emailTeste("alvo"), senha: TEST_PASSWORD },
      administrador.headers,
    );
    assert.ok(criado);

    await assert.rejects(
      () => createUsuario({ nome: "Duplicado", email: emailTeste("alvo"), senha: TEST_PASSWORD }, administrador.headers),
      (error: unknown) => error instanceof UsuarioError && error.message === "Já existe uma conta com este e-mail",
    );

    const editado = await updateUsuario(
      criado.id,
      { nome: `${TEST_PREFIX}Editado`, email: emailTeste("editado") },
      administrador.headers,
    );
    assert.equal(editado?.name, `${TEST_PREFIX}Editado`);
    assert.equal(editado?.email, emailTeste("editado"));

    const headersDoAlvo = await headersAutenticados(emailTeste("editado"));
    const sessaoDoAlvo = await auth.api.getSession({ headers: headersDoAlvo });
    assert.equal(sessaoDoAlvo?.user.id, criado.id);

    await removeUsuario(criado.id, administrador.headers);
    assert.equal(await getUsuarioOuNulo(criado.id), null);
    assert.equal(await prisma.session.count({ where: { userId: criado.id } }), 0);
    await assert.rejects(() => auth.api.signInEmail({ body: { email: emailTeste("editado"), password: TEST_PASSWORD } }));
  });
});

async function getUsuarioOuNulo(id: string) {
  return prisma.user.findUnique({ where: { id }, select: { id: true } });
}
