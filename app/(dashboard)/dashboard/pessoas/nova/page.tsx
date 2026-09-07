import { revalidatePath } from "next/cache";

import { type FichaSavePayload } from "@/components/pessoas/ficha-data";
import { FichaForm } from "@/components/pessoas/ficha-form";
import { createPessoa } from "@/lib/pessoas";

async function createPessoaAction(payload: FichaSavePayload) {
  "use server";
  const pessoa = await createPessoa(payload);
  revalidatePath("/dashboard/pessoas");
  revalidatePath(`/dashboard/pessoas/${pessoa.id}`);
  return { id: pessoa.id };
}

export default function NovaPessoaPage() {
  return (
    <div className="px-4 lg:px-6">
      <FichaForm action={createPessoaAction} mode="create" />
    </div>
  );
}
