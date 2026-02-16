"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { adminApi } from "@/lib/api/endpoints"
import {
  Building2,
  Users,
  Mail,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [dashboard, setDashboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getDashboard()
      setDashboard(response.data)
    } catch (error) {
      console.error("Failed to fetch dashboard:", error)
      toast.error("Ошибка при загрузке данных")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Дашборд администратора</h1>
        <p className="text-muted-foreground">
          Общая статистика системы
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего компаний
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.total_companies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Зарегистрировано в системе
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего пользователей
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Активных пользователей
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активные запросы
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.active_requests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Требуют внимания
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Рост системы</CardTitle>
          <CardDescription>
            Динамика регистрации компаний и пользователей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="companies">
            <TabsList>
              <TabsTrigger value="companies">Компании</TabsTrigger>
              <TabsTrigger value="users">Пользователи</TabsTrigger>
            </TabsList>

            <TabsContent value="companies" className="h-[400px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboard?.companies_growth || []}>
                  <defs>
                    <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), "dd.MM")}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), "dd MMMM yyyy", { locale: ru })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorCompanies)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="users" className="h-[400px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboard?.users_growth || []}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), "dd.MM")}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), "dd MMMM yyyy", { locale: ru })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Последние запросы</CardTitle>
          <CardDescription>
            Недавние запросы, требующие внимания
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboard?.recent_requests?.length > 0 ? (
            <div className="space-y-4">
              {dashboard.recent_requests.map((request: any) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/admin/requests`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {request.type === "company_registration" && <Building2 className="h-5 w-5" />}
                      {request.type === "user_join" && <Users className="h-5 w-5" />}
                      {request.type === "message" && <Mail className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {request.type === "company_registration" && "Регистрация новой фирмы"}
                        {request.type === "user_join" && "Запрос на вступление"}
                        {request.type === "message" && "Сообщение администратору"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        от {request.from_user_name} • {format(new Date(request.created_at), "dd.MM.yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Ожидает
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Нет активных запросов
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}