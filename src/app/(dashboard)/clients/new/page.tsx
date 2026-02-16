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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { clientsApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

const clientSchema = z.object({
  company_name: z.string().min(2, "Название должно содержать минимум 2 символа"),
  inn: z.string().regex(/^\d{10}$|^\d{12}$/, "ИНН должен содержать 10 или 12 цифр").optional().nullable(),
  director_name: z.string().optional().nullable(),
  access_type: z.enum(["public", "private"], {
    required_error: "Выберите тип доступа",
  }),
  note: z.string().optional().nullable(),
  granted_user_ids: z.array(z.number()).optional().default([]),
})

type ClientForm = z.infer<typeof clientSchema>

export default function NewClientPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showUserSelect, setShowUserSelect] = useState(false)

  const form = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      access_type: "public",
      granted_user_ids: [],
    },
  })

  const accessType = form.watch("access_type")

  const onSubmit = async (data: ClientForm) => {
    try {
      setIsLoading(true)
      await clientsApi.create(data)
      toast.success("Клиент успешно добавлен")
      router.push("/clients")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Ошибка при добавлении клиента")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Новый клиент</h1>
        <p className="text-muted-foreground">
          Добавьте нового клиента в систему
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>
                Заполните основную информацию о клиенте
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название фирмы</FormLabel>
                    <FormControl>
                      <Input placeholder="ООО 'Пример'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="inn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ИНН</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="1234567890" 
                          maxLength={12}
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>10 или 12 цифр</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="director_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Директор</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Иванов Иван Иванович" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Настройки доступа</CardTitle>
              <CardDescription>
                Выберите, кто может видеть этого клиента
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="access_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип доступа</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value)
                      setShowUserSelect(value === "private")
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип доступа" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Публичный (видят все)</SelectItem>
                        <SelectItem value="private">Приватный (только для себя)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {accessType === "public" 
                        ? "Клиента будут видеть все сотрудники фирмы" 
                        : "Клиента будете видеть только вы и выбранные сотрудники"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showUserSelect && (
                <div className="space-y-4 border rounded-lg p-4">
                  <FormLabel>Выберите сотрудников для доступа</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Вы можете дать доступ к этому клиенту определенным сотрудникам
                  </p>
                  <div className="space-y-2">
                    {/* Здесь будет список сотрудников с чекбоксами */}
                    <div className="flex items-center space-x-2">
                      <Checkbox id="user1" />
                      <label htmlFor="user1" className="text-sm">
                        Иван Иванов
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="user2" />
                      <label htmlFor="user2" className="text-sm">
                        Петр Петров
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Дополнительная информация</CardTitle>
              <CardDescription>
                Примечания и дополнительная информация
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Примечание</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Введите примечание (необязательно)"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Добавление..." : "Добавить клиента"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}