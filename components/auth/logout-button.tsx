"use client";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { IconLogout } from "@tabler/icons-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleLogOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/login");
          router.refresh();
        },
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
      },
    });
  }
  return (
    <DropdownMenuItem disabled={loading} onSelect={handleLogOut}>
      <IconLogout />
      {loading ? "Saindo..." : "Sair"}
    </DropdownMenuItem>
  );
}
