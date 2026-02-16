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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecentCertificatesProps {
  certificates: any[]
  title?: string
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  waiting_payment: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  on_review: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
}

const statusLabels: Record<string, string> = {
  new: "Новая",
  in_progress: "В процессе",
  waiting_payment: "Ждет оплату",
  on_review: "На проверке",
  completed: "Завершен",
  rejected: "Отклонен",
}

export function RecentCertificates({ 
  certificates, 
  title = "Последние сертификаты" 
}: RecentCertificatesProps) {
  if (!certificates.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Нет недавних сертификатов</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Award className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-sm text-muted-foreground text-center">
            У вас пока нет сертификатов
          </p>
          <Button className="mt-4" asChild>
            <Link href="/certificates/new">Создать заявку</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Последние 10 добавленных сертификатов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Тип</TableHead>
              <TableHead>Номер</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дедлайн</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((certificate) => (
              <TableRow key={certificate.id}>
                <TableCell className="font-medium">
                  {certificate.certificate_type}
                </TableCell>
                <TableCell>
                  {certificate.certificate_number || "—"}
                </TableCell>
                <TableCell>{certificate.client_name || "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "font-normal",
                      statusColors[certificate.status] || "bg-gray-100 text-gray-800"
                    )}
                  >
                    {statusLabels[certificate.status] || certificate.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(certificate.deadline), "dd.MM.yyyy", {
                    locale: ru,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/certificates/${certificate.id}`}>
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
            <Link href="/certificates">Все сертификаты</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}