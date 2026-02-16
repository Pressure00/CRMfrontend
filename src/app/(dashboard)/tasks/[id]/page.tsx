"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { tasksApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Building2,
  FileText,
  Award,
  FolderOpen,
  MoreVertical,
  Loader2,
  History,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [task, setTask] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const taskId = parseInt(params.id as string)
  const isDirector = user?.role === "director"
  const isCreator = task?.creator_user_id === user?.id
  const isExecutor = task?.target_user_id === user?.id

  useEffect(() => {
    fetchTask()
  }, [taskId])

  const fetchTask = async () => {
    try {
      setIsLoading(true)
      const response = await tasksApi.get(taskId)
      setTask(response.data)
    } catch (error) {
      console.error("Failed to fetch task:", error)
      toast.error("Не удалось загрузить задачу")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await tasksApi.delete(taskId)
      toast.success("Задача удалена")
      router.push("/tasks")
    } catch (error) {
      toast.error("Ошибка при удалении задачи")
    }
  }

  const handleStatusUpdate = async (status: string) => {
    try {
      await tasksApi.update(taskId, { status })
      toast.success("Статус обновлен")
      fetchTask()
    } catch (error) {
      toast.error("Ошибка при обновлении статуса")
    }
  }

  const isOverdue = () => {
    return task && new Date(task.deadline) < new Date() && task.status !== "completed"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Задача не найдена</p>
        <Button className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{task.title}</h1>
              {isOverdue() && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Просрочена
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Создано {format(new Date(task.created_at), "dd MMMM yyyy", { locale: ru })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(isDirector || isCreator) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/tasks/${taskId}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация о задаче</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Приоритет</dt>
                  <dd>
                    <Badge
                      variant="secondary"
                      className={cn("mt-1 font-normal", priorityColors[task.priority])}
                    >
                      {priorityLabels[task.priority]}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Статус</dt>
                  <dd>
                    <Badge
                      variant="secondary"
                      className={cn("mt-1 font-normal", statusColors[task.status])}
                    >
                      {statusLabels[task.status]}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Дедлайн</dt>
                  <dd className="text-lg font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(task.deadline), "dd.MM.yyyy")}
                  </dd>
                </div>
                {task.note && (
                  <div className="col-span-2">
                    <dt className="text-sm text-muted-foreground">Примечание</dt>
                    <dd className="text-base mt-1">{task.note}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Attachments */}
          {(task.attachments && task.attachments.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Прикрепленные объекты</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="documents">
                  <TabsList>
                    <TabsTrigger value="documents">Документы</TabsTrigger>
                    <TabsTrigger value="folders">Папки</TabsTrigger>
                    <TabsTrigger value="declarations">Декларации</TabsTrigger>
                    <TabsTrigger value="certificates">Сертификаты</TabsTrigger>
                  </TabsList>

                  <TabsContent value="documents" className="mt-4">
                    <div className="space-y-2">
                      {task.attachments
                        .filter((a: any) => a.document_id)
                        .map((attachment: any) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>{attachment.document_name}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              Открыть
                            </Button>
                          </div>
                        ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="folders" className="mt-4">
                    <div className="space-y-2">
                      {task.attachments
                        .filter((a: any) => a.folder_id)
                        .map((attachment: any) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4" />
                              <span>{attachment.folder_name}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              Открыть
                            </Button>
                          </div>
                        ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="declarations" className="mt-4">
                    <div className="space-y-2">
                      {task.attachments
                        .filter((a: any) => a.declaration_id)
                        .map((attachment: any) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>{attachment.declaration_number}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => router.push(`/declarations/${attachment.declaration_id}`)}
                            >
                              Открыть
                            </Button>
                          </div>
                        ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="certificates" className="mt-4">
                    <div className="space-y-2">
                      {task.attachments
                        .filter((a: any) => a.certificate_id)
                        .map((attachment: any) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              <span>{attachment.certificate_type}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => router.push(`/certificates/${attachment.certificate_id}`)}
                            >
                              Открыть
                            </Button>
                          </div>
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* History */}
          {task.history && task.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>История изменений</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {task.history.map((item: any) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{item.user_name}</span>
                          {" "}изменил(а) поле "{item.field}" 
                          {item.old_value && ` с "${item.old_value}"`} 
                          {" "}на "{item.new_value}"
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(item.created_at), "dd.MM.yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Исполнитель</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Фирма</dt>
                  <dd className="text-lg font-medium flex items-center gap-2 mt-1">
                    <Building2 className="h-4 w-4" />
                    {task.target_company_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Сотрудник</dt>
                  <dd className="text-lg font-medium flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    {task.target_user_name}
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Создатель</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Фирма</dt>
                  <dd className="text-lg font-medium flex items-center gap-2 mt-1">
                    <Building2 className="h-4 w-4" />
                    {task.creator_company_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Сотрудник</dt>
                  <dd className="text-lg font-medium flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    {task.creator_user_name}
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick status update for executors */}
          {isExecutor && task.status !== "completed" && task.status !== "cancelled" && (
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.status === "new" && (
                    <Button 
                      className="w-full"
                      onClick={() => handleStatusUpdate("in_progress")}
                    >
                      Начать работу
                    </Button>
                  )}
                  {task.status === "in_progress" && (
                    <>
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => handleStatusUpdate("waiting")}
                      >
                        Перевести в ожидание
                      </Button>
                      <Button 
                        className="w-full"
                        onClick={() => handleStatusUpdate("review")}
                      >
                        Отправить на проверку
                      </Button>
                    </>
                  )}
                  {task.status === "waiting" && (
                    <Button 
                      className="w-full"
                      onClick={() => handleStatusUpdate("in_progress")}
                    >
                      Вернуть в работу
                    </Button>
                  )}
                  {task.status === "review" && (
                    <Button 
                      className="w-full"
                      onClick={() => handleStatusUpdate("completed")}
                    >
                      Завершить
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить задачу</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить эту задачу? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}