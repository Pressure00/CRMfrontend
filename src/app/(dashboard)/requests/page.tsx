"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { requestsApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import {
  Building2,
  UserPlus,
  Handshake,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const requestTypeIcons: Record<string, any> = {
  company_registration: Building2,
  user_join: UserPlus,
  partnership: Handshake,
  message: MessageSquare,
}

const requestTypeLabels: Record<string, string> = {
  company_registration: "Регистрация фирмы",
  user_join: "Вступление в фирму",
  partnership: "Сотрудничество",
  message: "Сообщение",
}

const requestStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
}

const requestStatusLabels: Record<string, string> = {
  pending: "Ожидает",
  approved: "Одобрено",
  rejected: "Отклонено",
}

export default function RequestsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [actionNote, setActionNote] = useState("")
  const [messageText, setMessageText] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    fetchRequests()
  }, [filterType, filterStatus])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      if (filterType !== "all") params.type = filterType
      if (filterStatus !== "all") params.status = filterStatus
      
      const response = await requestsApi.list(params)
      setRequests(response.data)
    } catch (error) {
      console.error("Failed to fetch requests:", error)
      toast.error("Ошибка при загрузке запросов")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestAction = async (action: string) => {
    if (!selectedRequest) return
    try {
      setActionLoading(true)
      await requestsApi.handleRequest(selectedRequest.id, {
        action,
        note: actionNote || undefined,
      })
      toast.success(`Запрос ${action === "approve" ? "одобрен" : "отклонен"}`)
      fetchRequests()
      setShowActionDialog(false)
      setActionNote("")
    } catch (error) {
      toast.error("Ошибка при обработке запроса")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) return
    try {
      setActionLoading(true)
      await requestsApi.sendMessageToAdmin({ message: messageText })
      toast.success("Сообщение отправлено администратору")
      setShowMessageDialog(false)
      setMessageText("")
    } catch (error) {
      toast.error("Ошибка при отправке сообщения")
    } finally {
      setActionLoading(false)
    }
  }

  const getRequestIcon = (type: string) => {
    const Icon = requestTypeIcons[type] || Mail
    return <Icon className="h-5 w-5" />
  }

  const canApprove = (request: any) => {
    // Директор может одобрять запросы на вступление и сотрудничество
    if (user?.role === "director") {
      return request.type === "user_join" || request.type === "partnership"
    }
    return false
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Запросы</h1>
          <p className="text-muted-foreground">
            Управление входящими запросами и сообщениями
          </p>
        </div>
        {user?.role === "director" || user?.role === "senior" ? (
          <Button onClick={() => setShowMessageDialog(true)}>
            <Send className="mr-2 h-4 w-4" />
            Написать администратору
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
          <CardDescription>
            Отфильтруйте запросы по типу и статусу
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Тип запроса" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="company_registration">Регистрация фирмы</SelectItem>
                <SelectItem value="user_join">Вступление в фирму</SelectItem>
                <SelectItem value="partnership">Сотрудничество</SelectItem>
                <SelectItem value="message">Сообщения</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидает</SelectItem>
                <SelectItem value="approved">Одобрено</SelectItem>
                <SelectItem value="rejected">Отклонено</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список запросов</CardTitle>
          <CardDescription>
            Найдено {requests.length} запросов
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium">Нет запросов</p>
              <p className="text-sm text-muted-foreground">
                Здесь будут отображаться все входящие запросы
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {getRequestIcon(request.type)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">
                              {requestTypeLabels[request.type] || request.type}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={cn(requestStatusColors[request.status])}
                            >
                              {requestStatusLabels[request.status]}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(request.created_at), "dd.MM.yyyy HH:mm")}
                            </Badge>
                          </div>

                          {request.type === "company_registration" && (
                            <p className="text-sm">
                              <span className="font-medium">{request.from_user_name}</span> хочет 
                              зарегистрировать фирму <span className="font-medium">{request.data?.company_name}</span>
                            </p>
                          )}

                          {request.type === "user_join" && (
                            <p className="text-sm">
                              <span className="font-medium">{request.from_user_name}</span> хочет 
                              присоединиться к фирме <span className="font-medium">{request.to_company_name}</span>
                            </p>
                          )}

                          {request.type === "partnership" && (
                            <p className="text-sm">
                              <span className="font-medium">{request.from_company_name}</span> хочет 
                              сотрудничать с вашей фирмой
                            </p>
                          )}

                          {request.type === "message" && (
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">{request.from_user_name}</span> 
                                ({request.from_company_name}) написал:
                              </p>
                              <p className="text-sm mt-1 p-2 bg-muted rounded">
                                {request.data?.message}
                              </p>
                            </div>
                          )}

                          {request.note && (
                            <p className="text-sm text-muted-foreground">
                              Примечание: {request.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {request.status === "pending" && canApprove(request) && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowActionDialog(true)
                            }}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Рассмотреть
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Рассмотрение запроса</DialogTitle>
            <DialogDescription>
              {selectedRequest?.type === "user_join" && (
                <>Разрешить {selectedRequest?.from_user_name} присоединиться к фирме?</>
              )}
              {selectedRequest?.type === "partnership" && (
                <>Начать сотрудничество с {selectedRequest?.from_company_name}?</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Примечание (необязательно)"
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowActionDialog(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleRequestAction("reject")}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Отклонить
            </Button>
            <Button
              onClick={() => handleRequestAction("approve")}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Одобрить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message to Admin Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сообщение администратору</DialogTitle>
            <DialogDescription>
              Напишите сообщение для администратора системы
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Введите текст сообщения..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMessageDialog(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={actionLoading || !messageText.trim()}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Отправить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}