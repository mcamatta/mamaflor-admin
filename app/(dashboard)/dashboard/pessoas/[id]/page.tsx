import { notFound } from "next/navigation";

import { toFichaFormPessoa } from "@/components/pessoas/ficha-data";
import { FichaForm } from "@/components/pessoas/ficha-form";
import { getPessoa } from "@/lib/pessoas";

export default async function VerPessoaPage({
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
      <FichaForm mode="view" pessoa={toFichaFormPessoa(pessoa)} />
    </div>
  );
}
