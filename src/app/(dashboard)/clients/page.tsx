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
import { Skeleton } from "@/components/ui/skeleton"
import { clientsApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import {
  Plus,
  Search,
  MoreVertical,
  Building2,
  User,
  FileText,
  Award,
  FolderOpen,
  ClipboardList,
  Lock,
  Globe,
  Users,
  Loader2,
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

export default function ClientsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [searchParams, setSearchParams] = useState({
    company_name: "",
    inn: "",
    user_id: "",
  })

  useEffect(() => {
    fetchClients()
  }, [searchParams])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        skip: 0,
        limit: 100,
      }

      if (searchParams.company_name) params.company_name = searchParams.company_name
      if (searchParams.inn) params.inn = searchParams.inn
      if (searchParams.user_id) params.user_id = parseInt(searchParams.user_id)

      const response = await clientsApi.list(params)
      setClients(response.data)
    } catch (error) {
      console.error("Failed to fetch clients:", error)
      toast.error("Ошибка при загрузке клиентов")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedClient) return
    try {
      await clientsApi.delete(selectedClient.id)
      toast.success("Клиент удален")
      fetchClients()
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error("Ошибка при удалении клиента")
    }
  }

  const getAccessIcon = (type: string) => {
    const Icon = accessTypeIcons[type] || Users
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Клиенты</h1>
          <p className="text-muted-foreground">
            Управление клиентами вашей фирмы
          </p>
        </div>
        <Button onClick={() => router.push("/clients/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Новый клиент
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
          <CardDescription>
            Найдите клиентов по различным параметрам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название фирмы</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию..."
                  className="pl-10"
                  value={searchParams.company_name}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    company_name: e.target.value
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ИНН</label>
              <Input
                placeholder="Введите ИНН"
                value={searchParams.inn}
                onChange={(e) => setSearchParams({
                  ...searchParams,
                  inn: e.target.value
                })}
              />
            </div>

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
                  <SelectItem value={user?.id?.toString() || ""}>Мои клиенты</SelectItem>
                  {/* Здесь будет список сотрудников */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список клиентов</CardTitle>
          <CardDescription>
            Найдено {clients.length} клиентов
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium">Клиенты не найдены</p>
              <p className="text-sm text-muted-foreground">
                Добавьте первого клиента для работы
              </p>
              <Button className="mt-4" onClick={() => router.push("/clients/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить клиента
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Фирма</TableHead>
                    <TableHead>ИНН</TableHead>
                    <TableHead>Директор</TableHead>
                    <TableHead>Доступ</TableHead>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Статистика</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/clients/${client.id}`)}
                    >
                      <TableCell className="font-medium">
                        {client.company_name}
                      </TableCell>
                      <TableCell>{client.inn || "—"}</TableCell>
                      <TableCell>{client.director_name || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAccessIcon(client.access_type)}
                          <span className="text-sm">
                            {accessTypeLabels[client.access_type] || client.access_type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {client.user_name || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1">
                            <FileText className="h-3 w-3" />
                            {client.declarations_count || 0}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Award className="h-3 w-3" />
                            {client.certificates_count || 0}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <FolderOpen className="h-3 w-3" />
                            {client.folders_count || 0}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <ClipboardList className="h-3 w-3" />
                            {client.tasks_count || 0}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(client.created_at), "dd.MM.yyyy")}
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
                                router.push(`/clients/${client.id}`)
                              }}
                            >
                              Просмотр
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/clients/${client.id}/edit`)
                              }}
                            >
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedClient(client)
                                setShowDeleteDialog(true)
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

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить клиента</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить клиента {selectedClient?.company_name}?
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