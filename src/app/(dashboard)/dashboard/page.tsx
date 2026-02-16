"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { dashboardApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import { DashboardDeclarant } from "@/types"
import { DashboardStats } from "@/components/dashboard/stats"
import { RecentDeclarations } from "@/components/dashboard/recent-declarations"
import { RecentCertificates } from "@/components/dashboard/recent-certificates"

export default function DashboardPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardDeclarant | null>(null)
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [selectedUserId, setSelectedUserId] = useState<string>("all")

  const isDeclarant = user?.activity_type === "declarant"
  const isDirector = user?.role === "director"

  const fetchDashboard = async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      
      if (dateFrom) params.date_from = format(dateFrom, "yyyy-MM-dd")
      if (dateTo) params.date_to = format(dateTo, "yyyy-MM-dd")
      if (selectedUserId !== "all") params.user_id = parseInt(selectedUserId)

      const endpoint = isDeclarant
        ? dashboardApi.getDeclarantDashboard
        : dashboardApi.getCertifierDashboard

      const response = await endpoint(params)
      setDashboardData(response.data)
    } catch (error) {
      console.error("Failed to fetch dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [dateFrom, dateTo, selectedUserId, isDeclarant])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isDeclarant ? "Дашборд декларанта" : "Дашборд сертификатора"}
        </h1>
        
        <div className="flex items-center gap-4">
          {isDirector && (
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Выберите сотрудника" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все сотрудники</SelectItem>
                <SelectItem value={user?.id.toString()}>Мои данные</SelectItem>
                {/* Здесь будет список сотрудников из API */}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd.MM.yyyy") : "С даты"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                  locale={ru}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd.MM.yyyy") : "По дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                  locale={ru}
                />
              </PopoverContent>
            </Popover>

            <Button variant="ghost" onClick={() => {
              setDateFrom(undefined)
              setDateTo(undefined)
              setSelectedUserId("all")
            }}>
              Сбросить
            </Button>
          </div>
        </div>
      </div>

      {dashboardData && (
        <>
          <DashboardStats data={dashboardData} isDeclarant={isDeclarant} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isDeclarant ? (
              <>
                <RecentDeclarations declarations={dashboardData.recent_declarations || []} />
                <RecentCertificates certificates={dashboardData.recent_certificates || []} />
              </>
            ) : (
              <>
                <RecentCertificates 
                  certificates={dashboardData.recent_in_progress || []} 
                  title="В процессе"
                />
                <RecentCertificates 
                  certificates={dashboardData.recent_overdue || []} 
                  title="Просроченные"
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}