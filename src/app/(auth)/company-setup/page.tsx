"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Building2, Search, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const innSchema = z.string().regex(/^\d{9}$/, "ИНН должен состоять из 9 цифр")

const createSchema = z.object({
  name: z.string().min(2, "Название фирмы должно содержать минимум 2 символа"),
  inn: innSchema,
})

const joinSchema = z.object({
  inn: innSchema,
})

type CreateForm = z.infer<typeof createSchema>
type JoinForm = z.infer<typeof joinSchema>

export default function CompanySetupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"create" | "join">("create")
  const [isLoading, setIsLoading] = useState(false)
  const [lookupResult, setLookupResult] = useState<{
    found: boolean
    company_name?: string | null
    company_id?: number | null
  } | null>(null)

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  })

  const joinForm = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
  })

  const handleLookup = async (inn: string) => {
    try {
      setIsLoading(true)
      const response = await authApi.companyLookup({ inn })
      setLookupResult(response.data)
    } catch (error) {
      toast.error("Ошибка при поиске фирмы")
    } finally {
      setIsLoading(false)
    }
  }

  const onCreateSubmit = async (data: CreateForm) => {
    try {
      setIsLoading(true)
      await authApi.companyCreate(data)
      toast.success("Запрос на создание фирмы отправлен администратору")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Ошибка при создании фирмы")
    } finally {
      setIsLoading(false)
    }
  }

  const onJoinSubmit = async (data: JoinForm) => {
    try {
      setIsLoading(true)
      await authApi.companyJoin(data)
      toast.success("Запрос на вступление отправлен директору")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Ошибка при вступлении в фирму")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Настройка фирмы
          </CardTitle>
          <CardDescription className="text-center">
            {user?.full_name}, создайте новую фирму или войдите в существующую
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "create" | "join")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create">Создать фирму</TabsTrigger>
              <TabsTrigger value="join">Войти в фирму</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название фирмы</Label>
                  <Input
                    id="name"
                    placeholder="ООО 'Пример'"
                    {...createForm.register("name")}
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-inn">ИНН фирмы</Label>
                  <Input
                    id="create-inn"
                    placeholder="123456789"
                    maxLength={9}
                    {...createForm.register("inn")}
                    onChange={async (e) => {
                      createForm.register("inn").onChange(e)
                      if (e.target.value.length === 9) {
                        await handleLookup(e.target.value)
                      }
                    }}
                  />
                  {createForm.formState.errors.inn && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.inn.message}
                    </p>
                  )}
                </div>

                {lookupResult && (
                  <div
                    className={cn(
                      "p-3 rounded-lg text-sm",
                      lookupResult.found
                        ? "bg-destructive/10 text-destructive"
                        : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    )}
                  >
                    {lookupResult.found ? (
                      <p>Фирма с таким ИНН уже существует. Используйте "Войти в фирму"</p>
                    ) : (
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        ИНН свободен, можно создать фирму
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || lookupResult?.found}
                >
                  {isLoading ? "Создание..." : "Создать фирму"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join">
              <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join-inn">ИНН фирмы</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="join-inn"
                      placeholder="123456789"
                      maxLength={9}
                      className="pl-10"
                      {...joinForm.register("inn")}
                      onChange={async (e) => {
                        joinForm.register("inn").onChange(e)
                        if (e.target.value.length === 9) {
                          await handleLookup(e.target.value)
                        }
                      }}
                    />
                  </div>
                  {joinForm.formState.errors.inn && (
                    <p className="text-sm text-destructive">
                      {joinForm.formState.errors.inn.message}
                    </p>
                  )}
                </div>

                {lookupResult && (
                  <div
                    className={cn(
                      "p-3 rounded-lg text-sm",
                      !lookupResult.found
                        ? "bg-destructive/10 text-destructive"
                        : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    )}
                  >
                    {lookupResult.found ? (
                      <div className="space-y-1">
                        <p className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Фирма найдена:
                        </p>
                        <p className="font-medium">{lookupResult.company_name}</p>
                      </div>
                    ) : (
                      <p>Фирма с таким ИНН не найдена. Проверьте правильность ввода</p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !lookupResult?.found}
                >
                  {isLoading ? "Отправка..." : "Отправить запрос на вступление"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}