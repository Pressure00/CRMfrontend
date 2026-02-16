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
import { certificatesApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Filter,
  MoreVertical,
  Award,
  Loader2,
  User,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"

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

export default function CertificatesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchParams, setSearchParams] = useState({
    my_only: false,
    user_id: "",
    certifier_company_id: "",
    declarant_company_id: "",
    certificate_number: "",
    client_id: "",
    status: "",
    date_from: undefined as Date | undefined,
    date_to: undefined as Date | undefined,
  })
  const [showFilters, setShowFilters] = useState(false)

  const isDeclarant = user?.activity_type === "declarant"
  const isCertifier = user?.activity_type === "certifier"
  const isDirector = user?.role === "director"

  const fetchCertificates = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        skip: 0,
        limit: 50,
        my_only: searchParams.my_only,
      }

      if (searchParams.user_id) params.user_id = parseInt(searchParams.user_id)
      if (searchParams.certifier_company_id) params.certifier_company_id = parseInt(searchParams.certifier_company_id)
      if (searchParams.declarant_company_id) params.declarant_company_id = parseInt(searchParams.declarant_company_id)
      if (searchParams.certificate_number) params.certificate_number = searchParams.certificate_number
      if (searchParams.client_id) params.client_id = parseInt(searchParams.client_id)
      if (searchParams.status) params.status = searchParams.status
      if (searchParams.date_from) params.date_from = format(searchParams.date_from, "yyyy-MM-dd")
      if (searchParams.date_to) params.date_to = format(searchParams.date_to, "yyyy-MM-dd")

      const response = await certificatesApi.list(params)
      setCertificates(response.data)
    } catch (error) {
      console.error("Failed to fetch certificates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  const handleSearch = () => {
    fetchCertificates()
  }

  const handleReset = () => {
    setSearchParams({
      my_only: false,
      user_id: "",
      certifier_company_id: "",
      declarant_company_id: "",
      certificate_number: "",
      client_id: "",
      status: "",
      date_from: undefined,
      date_to: undefined,
    })
    setTimeout(fetchCertificates, 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Сертификаты</h1>
          <p className="text-muted-foreground">
            {isDeclarant 
              ? "Управление заявками на сертификаты" 
              : "Управление входящими заявками на сертификаты"}
          </p>
        </div>
        {isDeclarant && (
          <Button onClick={() => router.push("/certificates/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Новая заявка
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
          <CardDescription>
            Найдите сертификаты по различным параметрам
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по номеру сертификата..."
                className="pl-10"
                value={searchParams.certificate_number}
                onChange={(e) => setSearchParams({
                  ...searchParams,
                  certificate_number: e.target.value
                })}
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
                    <SelectItem value="all">Все сертификаты</SelectItem>
                    <SelectItem value="my">Мои сертификаты</SelectItem>
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

              {isDeclarant && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Фирма сертификатчиков</label>
                  <Select
                    value={searchParams.certifier_company_id}
                    onValueChange={(value) => setSearchParams({
                      ...searchParams,
                      certifier_company_id: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите фирму" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все фирмы</SelectItem>
                      {/* Здесь будет список фирм-сертификатчиков */}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isCertifier && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Фирма декларантов</label>
                  <Select
                    value={searchParams.declarant_company_id}
                    onValueChange={(value) => setSearchParams({
                      ...searchParams,
                      declarant_company_id: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите фирму" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все фирмы</SelectItem>
                      {/* Здесь будет список фирм-декларантов */}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                    <SelectItem value="in_progress">В процессе</SelectItem>
                    <SelectItem value="waiting_payment">Ждет оплату</SelectItem>
                    <SelectItem value="on_review">На проверке</SelectItem>
                    <SelectItem value="completed">Завершен</SelectItem>
                    <SelectItem value="rejected">Отклонен</SelectItem>
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
          <CardTitle>Список сертификатов</CardTitle>
          <CardDescription>
            Найдено {certificates.length} сертификатов
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : certificates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium">Сертификаты не найдены</p>
              <p className="text-sm text-muted-foreground">
                {isDeclarant 
                  ? "Создайте первую заявку на сертификат, чтобы начать работу"
                  : "Нет входящих заявок на сертификаты"}
              </p>
              {isDeclarant && (
                <Button className="mt-4" onClick={() => router.push("/certificates/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Создать заявку
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Тип</TableHead>
                    <TableHead>Номер</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дедлайн</TableHead>
                    {isDeclarant && <TableHead>Сертификатчик</TableHead>}
                    {isCertifier && <TableHead>Декларант</TableHead>}
                    <TableHead>Сотрудник</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((certificate) => (
                    <TableRow
                      key={certificate.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/certificates/${certificate.id}`)}
                    >
                      <TableCell className="font-medium">
                        {certificate.certificate_type}
                      </TableCell>
                      <TableCell>
                        {certificate.certificate_number || "—"}
                      </TableCell>
                      <TableCell>{certificate.client_name || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "font-normal",
                            statusColors[certificate.status]
                          )}
                        >
                          {statusLabels[certificate.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(certificate.deadline), "dd.MM.yyyy")}
                      </TableCell>
                      {isDeclarant && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {certificate.certifier_company_name || "Для себя"}
                          </div>
                        </TableCell>
                      )}
                      {isCertifier && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {certificate.declarant_company_name}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {certificate.assigned_user_name || certificate.declarant_user_name}
                        </div>
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
                                router.push(`/certificates/${certificate.id}`)
                              }}
                            >
                              Просмотр
                            </DropdownMenuItem>
                            {isDeclarant && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/certificates/${certificate.id}/edit`)
                                }}
                              >
                                Редактировать
                              </DropdownMenuItem>
                            )}
                            {isCertifier && certificate.status === "new" && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle assign to self
                                }}
                              >
                                Взять в работу
                              </DropdownMenuItem>
                            )}
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