import { revalidatePath } from "next/cache";

import { UsersPanel } from "@/components/usuarios/users-panel";
import { listUsuarios, removeUsuario } from "@/lib/usuarios";

type ActionResult = {
  ok: boolean;
  message: string;
};

function mensagemDeErro(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação";
}

function queryString(value: string | string[] | undefined) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

async function removeUsuarioAction(id: string): Promise<ActionResult> {
  "use server";

  try {
    await removeUsuario(id);
    revalidatePath("/dashboard/usuarios");
    revalidatePath(`/dashboard/usuarios/${id}`);
    revalidatePath(`/dashboard/usuarios/${id}/editar`);
    return { ok: true, message: "Usuário excluído com sucesso" };
  } catch (error) {
    return { ok: false, message: mensagemDeErro(error) };
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const busca = queryString(params.q);
  const usuarios = await listUsuarios(busca || undefined);

  return (
    <UsersPanel
      busca={busca}
      mode="list"
      removeAction={removeUsuarioAction}
      usuarios={usuarios}
    />
  );
}
