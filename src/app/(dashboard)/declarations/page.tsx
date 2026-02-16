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
import { declarationsApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import { DeclarationShort } from "@/types"
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Filter,
  MoreVertical,
  FileText,
  FolderPlus,
  Users,
  User,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function DeclarationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [declarations, setDeclarations] = useState<DeclarationShort[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchParams, setSearchParams] = useState({
    my_only: false,
    user_id: "",
    post_number: "",
    date_from: undefined as Date | undefined,
    date_to: undefined as Date | undefined,
    declaration_number: "",
    client_id: "",
    regime: "",
    vehicle_number: "",
    vehicle_type: "",
    group_id: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  const regimes = [
    "ЭК/10", "ЭК/11", "ЭК/12", "ИМ/40", "ИМ/41", "ИМ/42", "ИМ/51",
    "ЭК/51", "ЭК/61", "ИМ/61", "ИМ/70", "ИМ/71", "ЭК/71", "ИМ/72",
    "ЭК/72", "ИМ/73", "ЭК/73", "ИМ/74", "ЭК/74", "ИМ/75", "ЭК/75",
    "ИМ/76", "ТР/80", "НД/40", "ПР/40", "ПЕ/40", "ВД/40", "ВД/10", "ВД/74"
  ]

  const vehicleTypes = [
    "10/МОРСКОЙ",
    "20/ЖД",
    "30/АВТО",
    "40/АВИА",
    "71/ТРУБОПРОВОД",
    "72/ЛЭП",
    "80/РЕЧНОЙ",
    "90/САМОХОД"
  ]

  const fetchDeclarations = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        skip: 0,
        limit: 50,
        my_only: searchParams.my_only,
      }

      if (searchParams.user_id) params.user_id = parseInt(searchParams.user_id)
      if (searchParams.post_number) params.post_number = searchParams.post_number
      if (searchParams.date_from) params.date_from = format(searchParams.date_from, "yyyy-MM-dd")
      if (searchParams.date_to) params.date_to = format(searchParams.date_to, "yyyy-MM-dd")
      if (searchParams.declaration_number) params.declaration_number = searchParams.declaration_number
      if (searchParams.client_id) params.client_id = parseInt(searchParams.client_id)
      if (searchParams.regime) params.regime = searchParams.regime
      if (searchParams.vehicle_number) params.vehicle_number = searchParams.vehicle_number
      if (searchParams.vehicle_type) params.vehicle_type = searchParams.vehicle_type
      if (searchParams.group_id) params.group_id = parseInt(searchParams.group_id)

      const response = await declarationsApi.list(params)
      setDeclarations(response.data)
    } catch (error) {
      console.error("Failed to fetch declarations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDeclarations()
  }, [])

  const handleSearch = () => {
    fetchDeclarations()
  }

  const handleReset = () => {
    setSearchParams({
      my_only: false,
      user_id: "",
      post_number: "",
      date_from: undefined,
      date_to: undefined,
      declaration_number: "",
      client_id: "",
      regime: "",
      vehicle_number: "",
      vehicle_type: "",
      group_id: "",
    })
    setTimeout(fetchDeclarations, 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Декларации</h1>
          <p className="text-muted-foreground">
            Управление декларациями вашей фирмы
          </p>
        </div>
        <Button onClick={() => router.push("/declarations/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Новая декларация
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
          <CardDescription>
            Найдите декларации по различным параметрам
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по номеру декларации..."
                className="pl-10"
                value={searchParams.declaration_number}
                onChange={(e) => setSearchParams({
                  ...searchParams,
                  declaration_number: e.target.value
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
                    <SelectItem value="all">Все декларации</SelectItem>
                    <SelectItem value="my">Мои декларации</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!searchParams.my_only && (
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
                <label className="text-sm font-medium">Номер поста</label>
                <Input
                  placeholder="26001"
                  value={searchParams.post_number}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    post_number: e.target.value
                  })}
                />
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Режим</label>
                <Select
                  value={searchParams.regime}
                  onValueChange={(value) => setSearchParams({
                    ...searchParams,
                    regime: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите режим" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {regimes.map((regime) => (
                      <SelectItem key={regime} value={regime}>
                        {regime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Тип машины</label>
                <Select
                  value={searchParams.vehicle_type}
                  onValueChange={(value) => setSearchParams({
                    ...searchParams,
                    vehicle_type: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Номер машины</label>
                <Input
                  placeholder="А123ВЕ777"
                  value={searchParams.vehicle_number}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    vehicle_number: e.target.value
                  })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список деклараций</CardTitle>
          <CardDescription>
            Найдено {declarations.length} деклараций
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : declarations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium">Декларации не найдены</p>
              <p className="text-sm text-muted-foreground">
                Создайте первую декларацию, чтобы начать работу
              </p>
              <Button className="mt-4" onClick={() => router.push("/declarations/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Создать декларацию
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер декларации</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Режим</TableHead>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Группа</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {declarations.map((declaration) => (
                    <TableRow
                      key={declaration.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/declarations/${declaration.id}`)}
                    >
                      <TableCell className="font-medium">
                        {declaration.display_number}
                      </TableCell>
                      <TableCell>{declaration.client_name || "—"}</TableCell>
                      <TableCell>{declaration.regime}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {declaration.user_name || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {declaration.group_name ? (
                          <Badge variant="outline">
                            <FolderPlus className="h-3 w-3 mr-1" />
                            {declaration.group_name}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(declaration.created_at), "dd.MM.yyyy", {
                          locale: ru,
                        })}
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
                                router.push(`/declarations/${declaration.id}`)
                              }}
                            >
                              Просмотр
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/declarations/${declaration.id}/edit`)
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