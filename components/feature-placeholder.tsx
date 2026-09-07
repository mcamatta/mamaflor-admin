import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FeaturePlaceholder({
  title,
  description,
  icon: IconComponent,
  action,
}: {
  title: string;
  description: string;
  icon: Icon;
  action: string;
}) {
  return (
    <div className="px-4 lg:px-6">
      <Card className="max-w-3xl">
        <CardHeader>
          <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconComponent className="size-6" />
          </div>
          <div className="flex items-center gap-3">
            <CardTitle>{title}</CardTitle>
            <Badge variant="outline">Base do MVP</Badge>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled>{action}</Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Esta tela sinaliza o ponto de extensão; nenhuma regra de negócio foi simulada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
