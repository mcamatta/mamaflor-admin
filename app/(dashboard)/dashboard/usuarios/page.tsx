import { IconUserShield } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export default function UsersPage() {
  return (
    <FeaturePlaceholder
      action="Convidar usuário"
      description="Implemente aqui os usuários que terão acesso ao painel e seus perfis de permissão."
      icon={IconUserShield}
      title="Usuários do sistema"
    />
  );
}
