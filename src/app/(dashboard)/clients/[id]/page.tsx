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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { clientsApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  User,
  FileText,
  Award,
  FolderOpen,
  ClipboardList,
  Lock,
  Globe,
  Users,
  MoreVertical,
  Loader2,
  Phone,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const accessTypeIcons: Record<string, any> = {
  private: Lock,
  public: Globe,
}

const accessTypeLabels: Record<string, string> = {
  private: "Приватный",
  public: "Публичный",
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [client, setClient] = useState<any>(null)
  const [activity, setActivity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const clientId = parseInt(params.id as string)

  useEffect(() => {
    fetchClient()
  }, [clientId])

  const fetchClient = async () => {
    try {
      setIsLoading(true)
      const response = await clientsApi.get(clientId)
      setClient(response.data)
      
      // Fetch client activity
      const activityResponse = await clientsApi.getActivity(clientId)
      setActivity(activityResponse.data)
    } catch (error) {
      console.error("Failed to fetch client:", error)
      toast.error("Не удалось загрузить данные клиента")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await clientsApi.delete(clientId)
      toast.success("Клиент удален")
      router.push("/clients")
    } catch (error) {
      toast.error("Ошибка при удалении клиента")
    }
  }

  const AccessIcon = client ? accessTypeIcons[client.access_type] || Users : Users

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Клиент не найден</p>
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
              <h1 className="text-3xl font-bold">{client.company_name}</h1>
              <Badge variant="outline" className="gap-1">
                <AccessIcon className="h-3 w-3" />
                {accessTypeLabels[client.access_type]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Добавлен {format(new Date(client.created_at), "dd MMMM yyyy", { locale: ru })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/clients/${clientId}/edit`)}>
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация о клиенте</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">ИНН</dt>
                  <dd className="text-lg font-medium">{client.inn || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Директор</dt>
                  <dd className="text-lg font-medium">{client.director_name || "—"}</dd>
                </div>
                {client.note && (
                  <div className="col-span-2">
                    <dt className="text-sm text-muted-foreground">Примечание</dt>
                    <dd className="text-base">{client.note}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <FileText className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{client.declarations_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Деклараций</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Award className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{client.certificates_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Сертификатов</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <FolderOpen className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{client.folders_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Папок</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <ClipboardList className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{client.tasks_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Задач</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Tabs */}
          <Tabs defaultValue="declarations" className="w-full">
            <TabsList>
              <TabsTrigger value="declarations">Декларации</TabsTrigger>
              <TabsTrigger value="certificates">Сертификаты</TabsTrigger>
              <TabsTrigger value="documents">Документы</TabsTrigger>
              <TabsTrigger value="folders">Папки</TabsTrigger>
              <TabsTrigger value="tasks">Задачи</TabsTrigger>
            </TabsList>

            <TabsContent value="declarations" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {activity?.declarations?.length > 0 ? (
                    <div className="space-y-2">
                      {activity.declarations.map((decl: any) => (
                        <div
                          key={decl.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                          onClick={() => router.push(`/declarations/${decl.id}`)}
                        >
                          <div>
                            <p className="font-medium">{decl.display_number}</p>
                            <p className="text-sm text-muted-foreground">{decl.regime}</p>
                          </div>
                          <Badge>{format(new Date(decl.created_at), "dd.MM.yyyy")}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Нет деклараций для этого клиента
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certificates" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {activity?.certificates?.length > 0 ? (
                    <div className="space-y-2">
                      {activity.certificates.map((cert: any) => (
                        <div
                          key={cert.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                          onClick={() => router.push(`/certificates/${cert.id}`)}
                        >
                          <div>
                            <p className="font-medium">{cert.certificate_type}</p>
                            <p className="text-sm text-muted-foreground">{cert.status}</p>
                          </div>
                          <Badge>{format(new Date(cert.deadline), "dd.MM.yyyy")}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Нет сертификатов для этого клиента
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {activity?.documents?.length > 0 ? (
                    <div className="space-y-2">
                      {activity.documents.map((doc: any) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{doc.original_filename}</p>
                            <p className="text-sm text-muted-foreground">
                              {(doc.file_size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">Скачать</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Нет документов для этого клиента
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="folders" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {activity?.folders?.length > 0 ? (
                    <div className="space-y-2">
                      {activity.folders.map((folder: any) => (
                        <div
                          key={folder.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                          onClick={() => router.push(`/documents?folder=${folder.id}`)}
                        >
                          <div>
                            <p className="font-medium">{folder.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {folder.documents_count} файлов
                            </p>
                          </div>
                          <Badge variant="outline">{folder.access_type}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Нет папок для этого клиента
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {activity?.tasks?.length > 0 ? (
                    <div className="space-y-2">
                      {activity.tasks.map((task: any) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                          onClick={() => router.push(`/tasks/${task.id}`)}
                        >
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">{task.status}</p>
                          </div>
                          <Badge variant="outline">{task.priority}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Нет задач для этого клиента
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Доступ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Владелец</dt>
                  <dd className="text-lg font-medium flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    {client.user_name}
                  </dd>
                </div>
                
                {client.access_list && client.access_list.length > 0 && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Сотрудники с доступом</dt>
                    <dd className="mt-2 space-y-2">
                      {client.access_list.map((access: any) => (
                        <div key={access.id} className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {access.user_name}
                        </div>
                      ))}
                    </dd>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить клиента</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить клиента {client?.company_name}?
              Это действие нельзя отменить.
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