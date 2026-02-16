"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, addDays } from "date-fns"
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { certificatesApi } from "@/lib/api/endpoints"
import { cn } from "@/lib/utils"
import { CalendarIcon, Upload, Plus, X } from "lucide-react"
import { toast } from "sonner"

const certificateSchema = z.object({
  certifier_company_id: z.number().optional().nullable(),
  is_self: z.boolean().default(false),
  certificate_type: z.string().min(1, "Введите тип сертификата"),
  deadline: z.date({ required_error: "Выберите срок сертификата" }),
  certificate_number: z.string().optional(),
  is_number_by_certifier: z.boolean().default(false),
  client_id: z.number({ required_error: "Выберите клиента" }),
  declaration_ids: z.array(z.number()).optional().default([]),
  note: z.string().optional(),
  attachment_document_ids: z.array(z.number()).optional().default([]),
  attachment_folder_ids: z.array(z.number()).optional().default([]),
})

type CertificateForm = z.infer<typeof certificateSchema>

export default function NewCertificatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDeclarations, setSelectedDeclarations] = useState<any[]>([])

  const form = useForm<CertificateForm>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      is_self: false,
      is_number_by_certifier: false,
      declaration_ids: [],
      attachment_document_ids: [],
      attachment_folder_ids: [],
    },
  })

  const isSelf = form.watch("is_self")
  const isNumberByCertifier = form.watch("is_number_by_certifier")

  const onSubmit = async (data: CertificateForm) => {
    try {
      setIsLoading(true)
      
      const payload = {
        ...data,
        deadline: format(data.deadline, "yyyy-MM-dd"),
        certifier_company_id: data.is_self ? null : data.certifier_company_id,
      }

      await certificatesApi.create(payload)
      toast.success("Заявка на сертификат успешно создана")
      router.push("/certificates")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Ошибка при создании заявки")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Новая заявка на сертификат</h1>
        <p className="text-muted-foreground">
          Заполните форму для создания заявки на сертификат
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>
                Выберите сертификатчика и укажите тип сертификата
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="is_self"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Для себя</FormLabel>
                      <FormDescription>
                        Отметьте, если сертификат для своей фирмы
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {!isSelf && (
                <FormField
                  control={form.control}
                  name="certifier_company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Фирма сертификатчиков</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите фирму" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Здесь будет список фирм-сертификатчиков */}
                          <SelectItem value="1">ООО "Сертификат Про"</SelectItem>
                          <SelectItem value="2">АО "Центр сертификации"</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="certificate_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип сертификата</FormLabel>
                    <FormControl>
                      <Input placeholder="Например: ГОСТ Р ИСО 9001-2015" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Срок сертификата</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd.MM.yyyy")
                            ) : (
                              <span>Выберите дату</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Дата, до которой должен быть готов сертификат
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_number_by_certifier"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Номер заполнит сертификатчик</FormLabel>
                        <FormDescription>
                          Отметьте, если у вас нет номера сертификата
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {!isNumberByCertifier && (
                  <FormField
                    control={form.control}
                    name="certificate_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Номер сертификата</FormLabel>
                        <FormControl>
                          <Input placeholder="Введите номер сертификата" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Клиент</CardTitle>
              <CardDescription>
                Выберите клиента, для которого оформляется сертификат
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите клиента" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Здесь будет список клиентов */}
                        <SelectItem value="1">ООО "Торговый дом"</SelectItem>
                        <SelectItem value="2">ИП Иванов И.И.</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Декларации</CardTitle>
              <CardDescription>
                Привяжите декларации к сертификату (необязательно)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedDeclarations.map((decl, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span>{decl.display_number}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newDeclarations = selectedDeclarations.filter((_, i) => i !== index)
                        setSelectedDeclarations(newDeclarations)
                        form.setValue("declaration_ids", newDeclarations.map(d => d.id))
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Open declaration selection dialog
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Выбрать декларации
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Дополнительная информация</CardTitle>
              <CardDescription>
                Примечания и прикрепленные файлы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Прикрепленные файлы</FormLabel>
                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Перетащите файлы или выберите из документов
                  </p>
                  <Button type="button" variant="outline" size="sm" className="mt-2">
                    Выбрать файлы
                  </Button>
                </div>
              </div>
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
              {isLoading ? "Создание..." : "Создать заявку"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}