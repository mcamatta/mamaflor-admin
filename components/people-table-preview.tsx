import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const people = [
  { name: "Ana Souza", email: "ana@exemplo.com", status: "Ativo" },
  { name: "Carlos Lima", email: "carlos@exemplo.com", status: "Ativo" },
  { name: "João Pereira", email: "joao@exemplo.com", status: "Pendente" },
  { name: "Mariana Alves", email: "mariana@exemplo.com", status: "Ativo" },
];

export function PeopleTablePreview() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Cadastros recentes</CardTitle>
        <Button asChild size="sm" variant="ghost">
          <Link href="/dashboard/pessoas">
            Ver pessoas <IconArrowRight />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">E-mail</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.map((person) => (
              <TableRow key={person.email}>
                <TableCell className="font-medium">{person.name}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {person.email}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={person.status === "Ativo" ? "secondary" : "outline"}>
                    {person.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
