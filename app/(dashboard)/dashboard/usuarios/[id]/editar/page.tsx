import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import { UsersPanel } from "@/components/usuarios/users-panel";
import { getUsuario, updateUsuario } from "@/lib/usuarios";

type ActionResult = {
  ok: boolean;
  message: string;
};

function mensagemDeErro(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação";
}

async function updateUsuarioAction(
  id: string,
  input: { nome: string; email: string },
): Promise<ActionResult> {
  "use server";

  try {
    await updateUsuario(id, input);
    revalidatePath("/dashboard/usuarios");
    revalidatePath(`/dashboard/usuarios/${id}`);
    revalidatePath(`/dashboard/usuarios/${id}/editar`);
    return { ok: true, message: "Usuário atualizado com sucesso" };
  } catch (error) {
    return { ok: false, message: mensagemDeErro(error) };
  }
}

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await getUsuario(id);
  if (!usuario) notFound();

  return (
    <UsersPanel mode="edit" updateAction={updateUsuarioAction} usuario={usuario} />
  );
}
