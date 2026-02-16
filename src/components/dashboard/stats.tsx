import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Award,
  XCircle,
} from "lucide-react"

interface StatsProps {
  data: any
  isDeclarant: boolean
}

export function DashboardStats({ data, isDeclarant }: StatsProps) {
  if (isDeclarant) {
    const stats = [
      {
        title: "Активные задачи",
        value: data.active_tasks || 0,
        icon: Clock,
        color: "text-blue-500",
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
      },
      {
        title: "Выполненные задачи",
        value: data.completed_tasks || 0,
        icon: CheckCircle2,
        color: "text-green-500",
        bgColor: "bg-green-100 dark:bg-green-900/20",
      },
      {
        title: "Просроченные задачи",
        value: data.overdue_tasks || 0,
        icon: AlertCircle,
        color: "text-red-500",
        bgColor: "bg-red-100 dark:bg-red-900/20",
      },
      {
        title: "Отправленные декларации",
        value: data.sent_declarations || 0,
        icon: FileText,
        color: "text-purple-500",
        bgColor: "bg-purple-100 dark:bg-purple-900/20",
      },
      {
        title: "Сертификаты в процессе",
        value: data.in_progress_certificates || 0,
        icon: Award,
        color: "text-yellow-500",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      },
      {
        title: "Завершенные сертификаты",
        value: data.completed_certificates || 0,
        icon: CheckCircle2,
        color: "text-green-500",
        bgColor: "bg-green-100 dark:bg-green-900/20",
      },
      {
        title: "Просроченные сертификаты",
        value: data.overdue_certificates || 0,
        icon: XCircle,
        color: "text-red-500",
        bgColor: "bg-red-100 dark:bg-red-900/20",
      },
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Certifier stats
  const stats = [
    {
      title: "Активные задачи",
      value: data.active_tasks || 0,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Выполненные задачи",
      value: data.completed_tasks || 0,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Просроченные задачи",
      value: data.overdue_tasks || 0,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      title: "Сертификаты в процессе",
      value: data.in_progress_certificates || 0,
      icon: Award,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      title: "Завершенные сертификаты",
      value: data.completed_certificates || 0,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Просроченные сертификаты",
      value: data.overdue_certificates || 0,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={cn("p-2 rounded-lg", stat.bgColor)}>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}