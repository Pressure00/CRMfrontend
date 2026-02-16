"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { tasksApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Filter,
  MoreVertical,
  ClipboardList,
  Loader2,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
  PauseCircle,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  normal: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
}

const priorityLabels: Record<string, string> = {
  urgent: "Срочный",
  high: "Высокий",
  normal: "Обычный",
}

const statusColors: Record<string, string> = {
  new: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  waiting: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  review: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  frozen: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
}

const statusLabels: Record<string, string> = {
  new: "Новая",
  in_progress: "В работе",
  waiting: "Ожидание",
  review: "На проверке",
  completed: "Завершена",
  cancelled: "Отменена",
  frozen: "Заморожена",
}

export default function TasksPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchParams, setSearchParams] = useState({
    my_only: false,
    user_id: "",
    priority: "",
    status: "",
    date_from: undefined as Date | undefined,
    date_to: undefined as Date | undefined,
    target_company_id: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  const isDirector = user?.role === "director"
  const isDeclarant = user?.activity_type === "declarant"
  const isCertifier = user?.activity_type === "certifier"

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        skip: 0,
        limit: 50,
        my_only: searchParams.my_only,
      }

      if (searchParams.user_id) params.user_id = parseInt(searchParams.user_id)
      if (searchParams.priority) params.priority = searchParams.priority
      if (searchParams.status) params.status = searchParams.status
      if (searchParams.date_from) params.date_from = format(searchParams.date_from, "yyyy-MM-dd")
      if (searchParams.date_to) params.date_to = format(searchParams.date_to, "yyyy-MM-dd")
      if (searchParams.target_company_id) params.target_company_id = parseInt(searchParams.target_company_id)

      const response = await tasksApi.list(params)
      setTasks(response.data)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleSearch = () => {
    fetchTasks()
  }

  const handleReset = () => {
    setSearchParams({
      my_only: false,
      user_id: "",
      priority: "",
      status: "",
      date_from: undefined,
      date_to: undefined,
      target_company_id: "",
    })
    setTimeout(fetchTasks, 100)
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Задачи</h1>
          <p className="text-muted-foreground">
            Управление задачами и контроль выполнения
          </p>
        </div>
        <Button onClick={() => router.push("/tasks/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Новая задача
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
          <CardDescription>
            Найдите задачи по различным параметрам
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию задачи..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Фильтры
            </Button>
            <Button onClick={handleSearch}>Поиск</Button>
            <Button variant="ghost" onClick={handleReset}>
              Сбросить
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Тип просмотра</label>
                <Select
                  value={searchParams.my_only ? "my" : "all"}
                  onValueChange={(value) => setSearchParams({
                    ...searchParams,
                    my_only: value === "my",
                    user_id: value === "my" ? "" : searchParams.user_id
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все задачи</SelectItem>
                    <SelectItem value="my">Мои задачи</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!searchParams.my_only && isDirector && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Сотрудник</label>
                  <Select
                    value={searchParams.user_id}
                    onValueChange={(value) => setSearchParams({
                      ...searchParams,
                      user_id: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите сотрудника" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все сотрудники</SelectItem>
                      {/* Здесь будет список сотрудников */}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Приоритет</label>
                <Select
                  value={searchParams.priority}
                  onValueChange={(value) => setSearchParams({
                    ...searchParams,
                    priority: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все приоритеты</SelectItem>
                    <SelectItem value="urgent">Срочный</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="normal">Обычный</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Статус</label>
                <Select
                  value={searchParams.status}
                  onValueChange={(value) => setSearchParams({
                    ...searchParams,
                    status: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="new">Новая</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="waiting">Ожидание</SelectItem>
                    <SelectItem value="review">На проверке</SelectItem>
                    <SelectItem value="completed">Завершена</SelectItem>
                    <SelectItem value="cancelled">Отменена</SelectItem>
                    <SelectItem value="frozen">Заморожена</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Фирма</label>
                <Select
                  value={searchParams.target_company_id}
                  onValueChange={(value) => setSearchParams({
                    ...searchParams,
                    target_company_id: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите фирму" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все фирмы</SelectItem>
                    <SelectItem value="1">Моя фирма</SelectItem>
                    {/* Здесь будет список фирм-партнеров */}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Дата с</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !searchParams.date_from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchParams.date_from ? (
                        format(searchParams.date_from, "dd.MM.yyyy")
                      ) : (
                        "Выберите дату"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={searchParams.date_from}
                      onSelect={(date) => setSearchParams({
                        ...searchParams,
                        date_from: date
                      })}
                      initialFocus
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Дата по</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !searchParams.date_to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchParams.date_to ? (
                        format(searchParams.date_to, "dd.MM.yyyy")
                      ) : (
                        "Выберите дату"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={searchParams.date_to}
                      onSelect={(date) => setSearchParams({
                        ...searchParams,
                        date_to: date
                      })}
                      initialFocus
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список задач</CardTitle>
          <CardDescription>
            Найдено {tasks.length} задач
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium">Задачи не найдены</p>
              <p className="text-sm text-muted-foreground">
                Создайте первую задачу, чтобы начать работу
              </p>
              <Button className="mt-4" onClick={() => router.push("/tasks/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Создать задачу
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Приоритет</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Исполнитель</TableHead>
                    <TableHead>Дедлайн</TableHead>
                    <TableHead>Создатель</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/tasks/${task.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {task.title}
                          {isOverdue(task.deadline) && task.status !== "completed" && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn("font-normal", priorityColors[task.priority])}
                        >
                          {priorityLabels[task.priority]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn("font-normal", statusColors[task.status])}
                        >
                          {statusLabels[task.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {task.target_user_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(task.deadline), "dd.MM.yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>{task.creator_user_name}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/tasks/${task.id}`)
                              }}
                            >
                              Просмотр
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/tasks/${task.id}/edit`)
                              }}
                            >
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle delete
                              }}
                            >
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}