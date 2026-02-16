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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
import { declarationsApi } from "@/lib/api/endpoints"
import { DeclarationResponse } from "@/types"
import {
  ArrowLeft,
  Edit,
  Trash2,
  FolderPlus,
  FolderMinus,
  Users,
  FileText,
  Award,
  ClipboardList,
  MoreVertical,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

export default function DeclarationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [declaration, setDeclaration] = useState<DeclarationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const declarationId = parseInt(params.id as string)

  useEffect(() => {
    fetchDeclaration()
  }, [declarationId])

  const fetchDeclaration = async () => {
    try {
      setIsLoading(true)
      const response = await declarationsApi.get(declarationId)
      setDeclaration(response.data)
    } catch (error) {
      console.error("Failed to fetch declaration:", error)
      toast.error("Не удалось загрузить декларацию")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await declarationsApi.delete(declarationId)
      toast.success("Декларация удалена")
      router.push("/declarations")
    } catch (error) {
      toast.error("Ошибка при удалении декларации")
    }
  }

  const handleRedirect = async () => {
    // Open user selection dialog
    // Then call declarationsApi.redirect(declarationId, { target_user_id })
  }

  const handleAddToGroup = async () => {
    // Open group selection dialog
    // Then call declarationsApi.addToGroup(declarationId, { group_id })
  }

  const handleRemoveFromGroup = async () => {
    if (!declaration?.group_id) return
    try {
      await declarationsApi.removeFromGroup(declarationId)
      toast.success("Декларация удалена из группы")
      fetchDeclaration()
    } catch (error) {
      toast.error("Ошибка при удалении из группы")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!declaration) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Декларация не найдена</p>
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
            <h1 className="text-3xl font-bold">{declaration.display_number}</h1>
            <p className="text-muted-foreground">
              Создано {format(new Date(declaration.created_at), "dd MMMM yyyy", { locale: ru })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {declaration.group_id && (
            <Badge variant="outline" className="gap-1">
              <FolderPlus className="h-3 w-3" />
              {declaration.group_name}
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/declarations/${declarationId}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              
              {declaration.group_id ? (
                <DropdownMenuItem onClick={handleRemoveFromGroup}>
                  <FolderMinus className="mr-2 h-4 w-4" />
                  Удалить из группы
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleAddToGroup}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Добавить в группу
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={handleRedirect}>
                <Users className="mr-2 h-4 w-4" />
                Перенаправить
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
              <CardTitle>Информация о декларации</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Номер поста</dt>
                  <dd className="text-lg font-medium">{declaration.post_number}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Дата отправки</dt>
                  <dd className="text-lg font-medium">
                    {format(new Date(declaration.send_date), "dd.MM.yyyy")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Клиент</dt>
                  <dd className="text-lg font-medium">{declaration.client_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Режим</dt>
                  <dd className="text-lg font-medium">{declaration.regime}</dd>
                </div>
                {declaration.note && (
                  <div className="col-span-2">
                    <dt className="text-sm text-muted-foreground">Примечание</dt>
                    <dd className="text-base">{declaration.note}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Транспортные средства</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {declaration.vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="font-medium">{vehicle.vehicle_type}</span>
                    <span>{vehicle.vehicle_number}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {declaration.attachments && declaration.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Прикрепленные файлы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {declaration.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{attachment.document_name || attachment.folder_name}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Скачать
                      </Button>
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
              <CardTitle>Информация о сотруднике</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Сотрудник</dt>
                  <dd className="text-lg font-medium">{declaration.user_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Компания</dt>
                  <dd className="text-lg font-medium">{declaration.company_id}</dd>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="certificates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="certificates">
                <Award className="h-4 w-4 mr-2" />
                Сертификаты
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <ClipboardList className="h-4 w-4 mr-2" />
                Задачи
              </TabsTrigger>
            </TabsList>
            <TabsContent value="certificates">
              <Card>
                <CardContent className="pt-6">
                  {declaration.certificates_count ? (
                    <div className="text-center">
                      <p className="text-2xl font-bold">{declaration.certificates_count}</p>
                      <p className="text-sm text-muted-foreground">сертификатов</p>
                      <Button variant="link" className="mt-2">
                        Посмотреть все
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Нет привязанных сертификатов
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tasks">
              <Card>
                <CardContent className="pt-6">
                  {declaration.tasks_count ? (
                    <div className="text-center">
                      <p className="text-2xl font-bold">{declaration.tasks_count}</p>
                      <p className="text-sm text-muted-foreground">задач</p>
                      <Button variant="link" className="mt-2">
                        Посмотреть все
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Нет привязанных задач
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить декларацию</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить декларацию {declaration.display_number}?
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