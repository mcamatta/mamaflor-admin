import { ModeToggle } from "@/components/mode-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="px-4 lg:px-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>Escolha entre tema claro, escuro ou o padrão do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <ModeToggle />
        </CardContent>
      </Card>
    </div>
  );
}
