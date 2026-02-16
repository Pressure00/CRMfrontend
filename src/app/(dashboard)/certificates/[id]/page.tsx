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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { certificatesApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  FileText,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Upload,
  Download,
  MoreVertical,
  Loader2,
  Send,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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

export default function CertificateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [certificate, setCertificate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showNumberDialog, setShowNumberDialog] = useState(false)
  const [rejectNote, setRejectNote] = useState("")
  const [certificateNumber, setCertificateNumber] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const certificateId = parseInt(params.id as string)
  const isDeclarant = user?.activity_type === "declarant"
  const isCertifier = user?.activity_type === "certifier"
  const isDirector = user?.role === "director"

  useEffect(() => {
    fetchCertificate()
  }, [certificateId])

  const fetchCertificate = async () => {
    try {
      setIsLoading(true)
      const response = await certificatesApi.get(certificateId)
      setCertificate(response.data)
    } catch (error) {
      console.error("Failed to fetch certificate:", error)
      toast.error("Не удалось загрузить данные сертификата")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await certificatesApi.delete(certificateId)
      toast.success("Сертификат удален")
      router.push("/certificates")
    } catch (error) {
      toast.error("Ошибка при удалении сертификата")
    }
  }

  const handleStatusUpdate = async (status: string, note?: string) => {
    try {
      setActionLoading(true)
      await certificatesApi.updateStatus(certificateId, { status, rejection_note: note })
      toast.success("Статус обновлен")
      fetchCertificate()
    } catch (error) {
      toast.error("Ошибка при обновлении статуса")
    } finally {
      setActionLoading(false)
      setShowRejectDialog(false)
      setRejectNote("")
    }
  }

  const handleFillNumber = async () => {
    try {
      setActionLoading(true)
      await certificatesApi.fillNumber(certificateId, { certificate_number: certificateNumber })
      toast.success("Номер сертификата сохранен")
      fetchCertificate()
      setShowNumberDialog(false)
    } catch (error) {
      toast.error("Ошибка при сохранении номера")
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmReview = async () => {
    try {
      setActionLoading(true)
      await certificatesApi.confirmReview(certificateId)
      toast.success("Проверка подтверждена")
      fetchCertificate()
    } catch (error) {
      toast.error("Ошибка при подтверждении")
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    try {
      setActionLoading(true)
      await certificatesApi.confirmPayment(certificateId)
      toast.success("Оплата подтверждена")
      fetchCertificate()
    } catch (error) {
      toast.error("Ошибка при подтверждении оплаты")
    } finally {
      setActionLoading(false)
    }
  }

  const handleAssign = async () => {
    // Open user selection dialog
  }

  const handleRedirect = async () => {
    // Open user selection dialog
  }

  const handleUploadFile = async (fileType: string, file: File) => {
    try {
      await certificatesApi.uploadFile(certificateId, fileType, file)
      toast.success("Файл загружен")
      fetchCertificate()
    } catch (error) {
      toast.error("Ошибка при загрузке файла")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Сертификат не найден</p>
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
              <h1 className="text-3xl font-bold">
                {certificate.certificate_type}
              </h1>
              <Badge
                variant="secondary"
                className={cn(
                  "text-base px-3 py-1",
                  statusColors[certificate.status]
                )}
              >
                {statusLabels[certificate.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Заявка от {format(new Date(certificate.send_date), "dd MMMM yyyy", { locale: ru })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCertifier && certificate.status === "new" && (
            <Button onClick={() => handleStatusUpdate("in_progress")}>
              Взять в работу
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              
              {isDeclarant && (
                <DropdownMenuItem onClick={() => router.push(`/certificates/${certificateId}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Редактировать
                </DropdownMenuItem>
              )}
              
              {(isDirector || isCertifier) && (
                <DropdownMenuItem onClick={handleAssign}>
                  <Users className="mr-2 h-4 w-4" />
                  Назначить сотруднику
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={handleRedirect}>
                <Send className="mr-2 h-4 w-4" />
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
          {isCertifier && certificate.status !== "completed" && certificate.status !== "rejected" && (
            <Card>
              <CardHeader>
                <CardTitle>Действия</CardTitle>
                <CardDescription>
                  Управление статусом сертификата
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {certificate.status === "in_progress" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate("waiting_payment")}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Ждет оплату
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate("on_review")}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Отправить на проверку
                      </Button>
                    </>
                  )}

                  {certificate.status === "waiting_payment" && (
                    <Button
                      variant="outline"
                      onClick={handleConfirmPayment}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Подтвердить оплату
                    </Button>
                  )}

                  {certificate.status === "on_review" && (
                    <Button
                      variant="outline"
                      onClick={handleConfirmReview}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Подтвердить проверку
                    </Button>
                  )}

                  {!certificate.certificate_number && !certificate.is_number_by_certifier && (
                    <Button
                      variant="outline"
                      onClick={() => setShowNumberDialog(true)}
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Заполнить номер
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Отклонить
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isDeclarant && certificate.status === "on_review" && (
            <Card>
              <CardHeader>
                <CardTitle>Проверка документа</CardTitle>
                <CardDescription>
                  Подтвердите проверку документа от сертификатчика
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleConfirmReview}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Подтверждаю
                </Button>
              </CardContent>
            </Card>
          )}

          {isDeclarant && certificate.status === "waiting_payment" && (
            <Card>
              <CardHeader>
                <CardTitle>Оплата</CardTitle>
                <CardDescription>
                  Прикрепите платежные документы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Прикрепите платежные документы
                  </p>
                  <Button variant="outline" size="sm">
                    Выбрать файл
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Информация о сертификате</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Тип сертификата</dt>
                  <dd className="text-lg font-medium">{certificate.certificate_type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Номер сертификата</dt>
                  <dd className="text-lg font-medium">
                    {certificate.certificate_number || (
                      <span className="text-muted-foreground italic">
                        {certificate.is_number_by_certifier ? "Заполнит сертификатчик" : "Не указан"}
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Дедлайн</dt>
                  <dd className="text-lg font-medium">
                    {format(new Date(certificate.deadline), "dd.MM.yyyy")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Клиент</dt>
                  <dd className="text-lg font-medium">{certificate.client_name}</dd>
                </div>
                {certificate.note && (
                  <div className="col-span-2">
                    <dt className="text-sm text-muted-foreground">Примечание</dt>
                    <dd className="text-base">{certificate.note}</dd>
                  </div>
                )}
                {certificate.rejection_note && (
                  <div className="col-span-2">
                    <dt className="text-sm text-muted-foreground text-destructive">
                      Причина отклонения
                    </dt>
                    <dd className="text-base text-destructive">{certificate.rejection_note}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {certificate.files && certificate.files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Файлы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {certificate.files.map((file: any) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{file.original_filename}</p>
                          <p className="text-xs text-muted-foreground">
                            Загружен {format(new Date(file.created_at), "dd.MM.yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {certificate.actions && certificate.actions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>История действий</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certificate.actions.map((action: any) => (
                    <div key={action.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        {action.action === "status_change" && (
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                        {action.action === "payment_confirmed" && (
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                        {action.action === "review_confirmed" && (
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{action.user_name}</span>
                          {" "}{action.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(action.created_at), "dd.MM.yyyy HH:mm")}
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
              <CardTitle>Информация о компаниях</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Декларант</dt>
                  <dd className="text-lg font-medium">{certificate.declarant_company_name}</dd>
                  <dd className="text-sm text-muted-foreground">{certificate.declarant_user_name}</dd>
                </div>
                {certificate.certifier_company_name && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Сертификатчик</dt>
                    <dd className="text-lg font-medium">{certificate.certifier_company_name}</dd>
                    {certificate.assigned_user_name && (
                      <dd className="text-sm text-muted-foreground">{certificate.assigned_user_name}</dd>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {certificate.declarations && certificate.declarations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Привязанные декларации</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {certificate.declarations.map((decl: any) => (
                    <div
                      key={decl.id}
                      className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                      onClick={() => router.push(`/declarations/${decl.declaration_id}`)}
                    >
                      <p className="font-medium">{decl.display_number}</p>
                    </div>
                  ))}
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
            <DialogTitle>Удалить сертификат</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить.
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

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить заявку</DialogTitle>
            <DialogDescription>
              Укажите причину отклонения заявки
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Причина отклонения..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleStatusUpdate("rejected", rejectNote)}
              disabled={actionLoading || !rejectNote}
            >
              {actionLoading ? "Отклонение..." : "Отклонить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fill Number Dialog */}
      <Dialog open={showNumberDialog} onOpenChange={setShowNumberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заполнить номер сертификата</DialogTitle>
            <DialogDescription>
              Введите номер сертификата
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Номер сертификата"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNumberDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleFillNumber}
              disabled={actionLoading || !certificateNumber}
            >
              {actionLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}