import { notFound } from "next/navigation";

import { UsersPanel } from "@/components/usuarios/users-panel";
import { getUsuario } from "@/lib/usuarios";

export default async function VerUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await getUsuario(id);
  if (!usuario) notFound();

  return <UsersPanel mode="view" usuario={usuario} />;
}
