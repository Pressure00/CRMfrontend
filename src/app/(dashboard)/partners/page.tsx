"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { partnershipsApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import {
  Plus,
  Search,
  Building2,
  Handshake,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function PartnersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active")
  const [partners, setPartners] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  const [lookupInn, setLookupInn] = useState("")
  const [lookupResult, setLookupResult] = useState<any>(null)
  const [requestNote, setRequestNote] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      if (activeTab === "active") {
        const response = await partnershipsApi.list()
        setPartners(response.data)
      } else {
        const response = await partnershipsApi.listPending()
        setPendingRequests(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Ошибка при загрузке данных")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLookup = async () => {
    if (!lookupInn || lookupInn.length !== 9) {
      toast.error("ИНН должен содержать 9 цифр")
      return
    }

    try {
      setIsSearching(true)
      const response = await partnershipsApi.lookup({ target_inn: lookupInn })
      setLookupResult(response.data)
    } catch (error) {
      toast.error("Ошибка при поиске фирмы")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendRequest = async () => {
    if (!lookupResult?.found) {
      toast.error("Фирма не найдена")
      return
    }

    try {
      setIsSending(true)
      await partnershipsApi.sendRequest({
        target_inn: lookupInn,
        note: requestNote || undefined,
      })
      toast.success("Запрос на сотрудничество отправлен")
      setShowRequestDialog(false)
      setLookupInn("")
      setLookupResult(null)
      setRequestNote("")
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Ошибка при отправке запроса")
    } finally {
      setIsSending(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPartner) return
    try {
      await partnershipsApi.delete(selectedPartner.partnership_id)
      toast.success("Сотрудничество прекращено")
      fetchData()
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error("Ошибка при удалении")
    }
  }

  const handleRequestAction = async (requestId: number, action: string) => {
    try {
      await partnershipsApi.handleRequest(requestId, { action })
      toast.success(action === "approve" ? "Запрос одобрен" : "Запрос отклонен")
      fetchData()
    } catch (error) {
      toast.error("Ошибка при обработке запроса")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Сотрудничающие компании</h1>
          <p className="text-muted-foreground">
            Управление партнерскими отношениями с другими компаниями
          </p>
        </div>
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Отправить запрос
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Отправить запрос на сотрудничество</DialogTitle>
              <DialogDescription>
                Введите ИНН компании, с которой хотите сотрудничать
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ИНН компании</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="123456789"
                    maxLength={9}
                    value={lookupInn}
                    onChange={(e) => {
                      setLookupInn(e.target.value)
                      setLookupResult(null)
                    }}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleLookup}
                    disabled={isSearching || lookupInn.length !== 9}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {lookupResult && (
                <div className={cn(
                  "p-4 rounded-lg",
                  lookupResult.found 
                    ? "bg-green-100 dark:bg-green-900/20" 
                    : "bg-destructive/10"
                )}>
                  {lookupResult.found ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <p className="font-medium text-green-600">Фирма найдена</p>
                      </div>
                      <p className="text-sm">Название: {lookupResult.company_name}</p>
                      <p className="text-sm">Вид деятельности: {lookupResult.activity_type}</p>
                    </div>
                  ) : (
                    <p className="text-destructive">Фирма с таким ИНН не найдена</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Примечание (необязательно)</label>
                <Textarea
                  placeholder="Введите примечание к запросу"
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                Отмена
              </Button>
              <Button 
                onClick={handleSendRequest}
                disabled={!lookupResult?.found || isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  "Отправить запрос"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "pending")}>
        <TabsList>
          <TabsTrigger value="active">Активные партнеры</TabsTrigger>
          <TabsTrigger value="pending">Входящие запросы</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Партнерские компании</CardTitle>
              <CardDescription>
                Компании, с которыми установлено сотрудничество
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : partners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Handshake className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-lg font-medium">Нет партнеров</p>
                  <p className="text-sm text-muted-foreground">
                    Отправьте запрос на сотрудничество с другими компаниями
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Компания</TableHead>
                        <TableHead>ИНН</TableHead>
                        <TableHead>Вид деятельности</TableHead>
                        <TableHead>Сотрудничает с</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map((partner) => (
                        <TableRow key={partner.partnership_id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {partner.company_name}
                            </div>
                          </TableCell>
                          <TableCell>{partner.company_inn}</TableCell>
                          <TableCell>{partner.activity_type}</TableCell>
                          <TableCell>
                            {format(new Date(partner.created_at), "dd.MM.yyyy")}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedPartner(partner)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Входящие запросы</CardTitle>
              <CardDescription>
                Запросы на сотрудничество от других компаний
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-lg font-medium">Нет входящих запросов</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <h3 className="font-semibold">{request.requester_company_name}</h3>
                              <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(request.created_at), "dd.MM.yyyy")}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ИНН: {request.requester_company_inn}
                            </p>
                            {request.note && (
                              <p className="text-sm">Примечание: {request.note}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRequestAction(request.id, "approve")}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Принять
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestAction(request.id, "reject")}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Отклонить
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Прекратить сотрудничество</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите прекратить сотрудничество с {selectedPartner?.company_name}?
              Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Прекратить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}