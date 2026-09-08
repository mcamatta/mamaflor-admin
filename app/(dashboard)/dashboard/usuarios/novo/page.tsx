import { revalidatePath } from "next/cache";

import { UsersPanel } from "@/components/usuarios/users-panel";
import { createUsuario } from "@/lib/usuarios";

type ActionResult = {
  ok: boolean;
  message: string;
};

function mensagemDeErro(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação";
}

async function createUsuarioAction(input: {
  nome: string;
  email: string;
  senha: string;
}): Promise<ActionResult> {
  "use server";

  try {
    const usuario = await createUsuario(input);
    revalidatePath("/dashboard/usuarios");
    if (usuario) {
      revalidatePath(`/dashboard/usuarios/${usuario.id}`);
      revalidatePath(`/dashboard/usuarios/${usuario.id}/editar`);
    }
    return { ok: true, message: "Usuário criado com sucesso" };
  } catch (error) {
    return { ok: false, message: mensagemDeErro(error) };
  }
}

export default function NovoUsuarioPage() {
  return <UsersPanel createAction={createUsuarioAction} mode="create" />;
}
