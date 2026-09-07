import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="px-4 lg:px-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Minha conta</CardTitle>
          <CardDescription>
            Dados do usuário autenticado. A edição pode ser adicionada conforme o MVP evoluir.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" readOnly value={session.user.name} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" readOnly value={session.user.email} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
