"use client"

import { useState, useEffect } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { adminApi } from "@/lib/api/endpoints"
import {
  Search,
  MoreVertical,
  Building2,
  Ban,
  Unlock,
  Trash2,
  Mail,
  Users,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function AdminCompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchParams, setSearchParams] = useState({
    search: "",
    activity_type: "",
    is_active: "",
  })
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showUnblockDialog, setShowUnblockDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageText, setMessageText] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [searchParams])

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        skip: 0,
        limit: 50,
      }
      
      if (searchParams.search) params.search = searchParams.search
      if (searchParams.activity_type && searchParams.activity_type !== "all") {
        params.activity_type = searchParams.activity_type
      }
      if (searchParams.is_active && searchParams.is_active !== "all") {
        params.is_active = searchParams.is_active === "active"
      }

      const response = await adminApi.listCompanies(params)
      setCompanies(response.data)
    } catch (error) {
      console.error("Failed to fetch companies:", error)
      toast.error("Ошибка при загрузке компаний")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlock = async () => {
    if (!selectedCompany) return
    try {
      setActionLoading(true)
      await adminApi.blockCompany(selectedCompany.id)
      toast.success("Компания заблокирована")
      fetchCompanies()
      setShowBlockDialog(false)
    } catch (error) {
      toast.error("Ошибка при блокировке компании")
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnblock = async () => {
    if (!selectedCompany) return
    try {
      setActionLoading(true)
      await adminApi.unblockCompany(selectedCompany.id)
      toast.success("Компания разблокирована")
      fetchCompanies()
      setShowUnblockDialog(false)
    } catch (error) {
      toast.error("Ошибка при разблокировке компании")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCompany) return
    try {
      setActionLoading(true)
      await adminApi.deleteCompany(selectedCompany.id)
      toast.success("Компания удалена")
      fetchCompanies()
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error("Ошибка при удалении компании")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedCompany || !messageText.trim()) return
    try {
      setActionLoading(true)
      await adminApi.sendMessageToCompany(selectedCompany.id, { message: messageText })
      toast.success("Сообщение отправлено")
      setShowMessageDialog(false)
      setMessageText("")
    } catch (error) {
      toast.error("Ошибка при отправке сообщения")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Фирмы</h1>
        <p className="text-muted-foreground">
          Управление зарегистрированными компаниями
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
          <CardDescription>
            Найдите компании по различным параметрам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Поиск</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Название или ИНН..."
                  className="pl-10"
                  value={searchParams.search}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    search: e.target.value
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Вид деятельности</label>
              <Select
                value={searchParams.activity_type}
                onValueChange={(value) => setSearchParams({
                  ...searchParams,
                  activity_type: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="declarant">Декларанты</SelectItem>
                  <SelectItem value="certifier">Сертификатчики</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Статус</label>
              <Select
                value={searchParams.is_active}
                onValueChange={(value) => setSearchParams({
                  ...searchParams,
                  is_active: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список компаний</CardTitle>
          <CardDescription>
            Найдено {companies.length} компаний
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium">Компании не найдены</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Компания</TableHead>
                    <TableHead>ИНН</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Директор</TableHead>
                    <TableHead>Сотрудников</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow
                      key={company.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/admin/companies/${company.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {company.name}
                        </div>
                      </TableCell>
                      <TableCell>{company.inn}</TableCell>
                      <TableCell>
                        {company.activity_type === "declarant" ? "Декларант" : "Сертификатчик"}
                      </TableCell>
                      <TableCell>{company.director_name || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {company.members_count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {company.is_blocked ? (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="h-3 w-3" />
                            Заблокирована
                          </Badge>
                        ) : company.is_active ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Активна
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Неактивна
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(company.created_at), "dd.MM.yyyy")}
                      </TableCell>
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
                                setSelectedCompany(company)
                                setShowMessageDialog(true)
                              }}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Отправить сообщение
                            </DropdownMenuItem>
                            
                            {!company.is_blocked ? (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedCompany(company)
                                  setShowBlockDialog(true)
                                }}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Заблокировать
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedCompany(company)
                                  setShowUnblockDialog(true)
                                }}
                              >
                                <Unlock className="mr-2 h-4 w-4" />
                                Разблокировать
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedCompany(company)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Block Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заблокировать компанию</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите заблокировать компанию {selectedCompany?.name}?
              Все сотрудники не смогут войти в систему.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleBlock} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Ban className="mr-2 h-4 w-4" />
              )}
              Заблокировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock Dialog */}
      <Dialog open={showUnblockDialog} onOpenChange={setShowUnblockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Разблокировать компанию</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите разблокировать компанию {selectedCompany?.name}?
              Сотрудники смогут снова войти в систему.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnblockDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleUnblock} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Unlock className="mr-2 h-4 w-4" />
              )}
              Разблокировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить компанию</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить компанию {selectedCompany?.name}?
              Все данные компании и сотрудников будут безвозвратно удалены.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отправить сообщение</DialogTitle>
            <DialogDescription>
              Сообщение будет отправлено директору компании {selectedCompany?.name}
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
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={actionLoading || !messageText.trim()}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Отправить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}