import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import {
  toFichaFormPessoa,
  type FichaSavePayload,
} from "@/components/pessoas/ficha-data";
import { FichaForm } from "@/components/pessoas/ficha-form";
import { getPessoa, updatePessoa } from "@/lib/pessoas";

async function updatePessoaAction(id: number, payload: FichaSavePayload) {
  "use server";
  const pessoa = await updatePessoa(id, payload);
  revalidatePath("/dashboard/pessoas");
  revalidatePath(`/dashboard/pessoas/${pessoa.id}`);
  revalidatePath(`/dashboard/pessoas/${pessoa.id}/editar`);
  return { id: pessoa.id };
}

export default async function EditarPessoaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) notFound();

  const pessoa = await getPessoa(id);
  if (!pessoa) notFound();

  return (
    <div className="px-4 lg:px-6">
      <FichaForm
        action={updatePessoaAction.bind(null, id)}
        mode="edit"
        pessoa={toFichaFormPessoa(pessoa)}
      />
    </div>
  );
}
