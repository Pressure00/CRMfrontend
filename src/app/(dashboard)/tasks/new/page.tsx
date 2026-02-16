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
import { Separator } from "@/components/ui/separator"
import { tasksApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { CalendarIcon, Plus, X, FileText, Award, FolderOpen } from "lucide-react"
import { toast } from "sonner"

const taskSchema = z.object({
  target_company_id: z.number({ required_error: "Выберите фирму" }),
  target_user_id: z.number({ required_error: "Выберите сотрудника" }),
  title: z.string().min(3, "Название должно содержать минимум 3 символа"),
  note: z.string().optional(),
  priority: z.enum(["urgent", "high", "normal"], {
    required_error: "Выберите приоритет",
  }),
  status: z.enum(["new", "in_progress", "waiting", "review", "completed", "cancelled", "frozen"], {
    required_error: "Выберите статус",
  }),
  deadline: z.date({ required_error: "Выберите дедлайн" }),
  attachment_document_ids: z.array(z.number()).optional().default([]),
  attachment_folder_ids: z.array(z.number()).optional().default([]),
  attachment_declaration_ids: z.array(z.number()).optional().default([]),
  attachment_certificate_ids: z.array(z.number()).optional().default([]),
})

type TaskForm = z.infer<typeof taskSchema>

export default function NewTaskPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [attachments, setAttachments] = useState<{
    documents: any[],
    folders: any[],
    declarations: any[],
    certificates: any[],
  }>({
    documents: [],
    folders: [],
    declarations: [],
    certificates: [],
  })

  const form = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: "normal",
      status: "new",
      attachment_document_ids: [],
      attachment_folder_ids: [],
      attachment_declaration_ids: [],
      attachment_certificate_ids: [],
    },
  })

  const onSubmit = async (data: TaskForm) => {
    try {
      setIsLoading(true)

      const payload = {
        ...data,
        deadline: format(data.deadline, "yyyy-MM-dd"),
      }

      await tasksApi.create(payload)
      toast.success("Задача успешно создана")
      router.push("/tasks")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Ошибка при создании задачи")
    } finally {
      setIsLoading(false)
    }
  }

  const priorityOptions = [
    { value: "urgent", label: "Срочный", color: "text-red-600" },
    { value: "high", label: "Высокий приоритет", color: "text-orange-600" },
    { value: "normal", label: "Обычный", color: "text-blue-600" },
  ]

  const statusOptions = [
    { value: "new", label: "Новая" },
    { value: "in_progress", label: "В работе" },
    { value: "waiting", label: "Ожидание" },
    { value: "review", label: "На проверке" },
    { value: "completed", label: "Завершена" },
    { value: "cancelled", label: "Отменена" },
    { value: "frozen", label: "Заморожена" },
  ]

  const removeAttachment = (type: string, id: number) => {
    setAttachments(prev => ({
      ...prev,
      [type]: prev[type as keyof typeof prev].filter(item => item.id !== id)
    }))

    const fieldMap = {
      documents: "attachment_document_ids",
      folders: "attachment_folder_ids",
      declarations: "attachment_declaration_ids",
      certificates: "attachment_certificate_ids",
    }

    const fieldName = fieldMap[type as keyof typeof fieldMap] as keyof TaskForm
    const currentIds = (form.getValues(fieldName) as number[]) || []

    form.setValue(
      fieldName,
      currentIds.filter(i => i !== id)
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Новая задача</h1>
        <p className="text-muted-foreground">
          Создайте задачу для сотрудника
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>
                Выберите исполнителя и укажите детали задачи
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="target_company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Фирма</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(parseInt(value))
                          setSelectedCompany(value)
                          // Reset user selection when company changes
                          form.setValue("target_user_id", undefined as any)
                        }}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите фирму" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={user?.company_id?.toString() || ""}>
                            Моя фирма
                          </SelectItem>
                          {/* Здесь будет список фирм-партнеров */}
                          <SelectItem value="2">ООО "Сертификат Про"</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Сотрудник</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        disabled={!selectedCompany}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              selectedCompany ? "Выберите сотрудника" : "Сначала выберите фирму"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Здесь будет список сотрудников выбранной фирмы */}
                          <SelectItem value="1">Иван Иванов</SelectItem>
                          <SelectItem value="2">Петр Петров</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название задачи</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите название задачи" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Приоритет</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите приоритет" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className={option.color}>{option.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Статус</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите статус" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Дедлайн</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Прикрепленные объекты</CardTitle>
              <CardDescription>
                Прикрепите документы, декларации или сертификаты к задаче
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Documents */}
              <div>
                <h3 className="text-sm font-medium mb-2">Документы</h3>
                <div className="space-y-2">
                  {attachments.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{doc.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttachment("documents", doc.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Open document selection dialog
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Выбрать документы
                  </Button>
                </div>
              </div>

              {/* Folders */}
              <div>
                <h3 className="text-sm font-medium mb-2">Папки</h3>
                <div className="space-y-2">
                  {attachments.folders.map((folder) => (
                    <div key={folder.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        <span className="text-sm">{folder.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttachment("folders", folder.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Open folder selection dialog
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Выбрать папки
                  </Button>
                </div>
              </div>

              {/* Declarations */}
              <div>
                <h3 className="text-sm font-medium mb-2">Декларации</h3>
                <div className="space-y-2">
                  {attachments.declarations.map((decl) => (
                    <div key={decl.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{decl.display_number}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttachment("declarations", decl.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Open declaration selection dialog
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Выбрать декларации
                  </Button>
                </div>
              </div>

              {/* Certificates */}
              <div>
                <h3 className="text-sm font-medium mb-2">Сертификаты</h3>
                <div className="space-y-2">
                  {attachments.certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span className="text-sm">{cert.certificate_type}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttachment("certificates", cert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Open certificate selection dialog
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Выбрать сертификаты
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
              {isLoading ? "Создание..." : "Создать задачу"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}