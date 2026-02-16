import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

interface RecentDeclarationsProps {
  declarations: any[]
}

export function RecentDeclarations({ declarations }: RecentDeclarationsProps) {
  if (!declarations.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Последние декларации</CardTitle>
          <CardDescription>Нет недавних деклараций</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-sm text-muted-foreground text-center">
            У вас пока нет деклараций
          </p>
          <Button className="mt-4" asChild>
            <Link href="/declarations/new">Создать декларацию</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние декларации</CardTitle>
        <CardDescription>
          Последние 10 добавленных деклараций
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Номер</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Режим</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {declarations.map((declaration) => (
              <TableRow key={declaration.id}>
                <TableCell className="font-medium">
                  {declaration.display_number}
                </TableCell>
                <TableCell>{declaration.client_name || "—"}</TableCell>
                <TableCell>{declaration.regime}</TableCell>
                <TableCell>
                  {format(new Date(declaration.created_at), "dd.MM.yyyy", {
                    locale: ru,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/declarations/${declaration.id}`}>
                      Открыть
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 text-right">
          <Button variant="outline" size="sm" asChild>
            <Link href="/declarations">Все декларации</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}