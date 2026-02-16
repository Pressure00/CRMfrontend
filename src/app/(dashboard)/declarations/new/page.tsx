"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { declarationsApi } from "@/lib/api/endpoints"
import { cn } from "@/lib/utils"
import { CalendarIcon, Plus, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

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

const declarationSchema = z.object({
  post_number: z.string().min(5, "Номер поста должен содержать минимум 5 символов"),
  send_date: z.date({ required_error: "Выберите дату отправки" }),
  declaration_number: z.string().min(7, "Номер декларации должен содержать минимум 7 символов"),
  client_id: z.number({ required_error: "Выберите клиента" }),
  regime: z.string({ required_error: "Выберите режим" }),
  vehicles: z.array(z.object({
    vehicle_type: z.string({ required_error: "Выберите тип машины" }),
    vehicle_number: z.string().min(1, "Введите номер машины"),
  })).min(1, "Добавьте хотя бы одно транспортное средство"),
  note: z.string().optional(),
  attachment_document_ids: z.array(z.number()).optional(),
  attachment_folder_ids: z.array(z.number()).optional(),
})

type DeclarationForm = z.infer<typeof declarationSchema>

export default function NewDeclarationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)

  const form = useForm<DeclarationForm>({
    resolver: zodResolver(declarationSchema),
    defaultValues: {
      vehicles: [{ vehicle_type: "", vehicle_number: "" }],
      attachment_document_ids: [],
      attachment_folder_ids: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "vehicles",
  })

  const onSubmit = async (data: DeclarationForm) => {
    try {
      setIsLoading(true)
      
      // Format data for API
      const payload = {
        ...data,
        send_date: format(data.send_date, "yyyy-MM-dd"),
        vehicles: data.vehicles.map(v => ({
          vehicle_type: v.vehicle_type,
          vehicle_number: v.vehicle_number,
        })),
      }

      await declarationsApi.create(payload)
      toast.success("Декларация успешно создана")
      router.push("/declarations")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Ошибка при создании декларации")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Новая декларация</h1>
        <p className="text-muted-foreground">
          Заполните форму для создания новой декларации
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>
                Заполните основную информацию о декларации
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="post_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Номер поста</FormLabel>
                      <FormControl>
                        <Input placeholder="26001" {...field} />
                      </FormControl>
                      <FormDescription>5 цифр</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="send_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Дата отправки</FormLabel>
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
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
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
                  name="declaration_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Номер декларации</FormLabel>
                      <FormControl>
                        <Input placeholder="0010722" {...field} />
                      </FormControl>
                      <FormDescription>7 цифр</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Клиент</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value))
                        // Здесь можно загрузить данные клиента
                      }}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите клиента" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Здесь будет список клиентов */}
                        <SelectItem value="1">ООО "Пример"</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="regime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Режим декларации</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите режим" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {regimes.map((regime) => (
                          <SelectItem key={regime} value={regime}>
                            {regime}
                          </SelectItem>
                        ))}
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
              <CardTitle>Транспортные средства</CardTitle>
              <CardDescription>
                Добавьте транспортные средства, участвующие в декларации
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.vehicle_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Тип машины</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите тип" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vehicleTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
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
                        name={`vehicles.${index}.vehicle_number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Номер машины</FormLabel>
                            <FormControl>
                              <Input placeholder="А123ВЕ777" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-8"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ vehicle_type: "", vehicle_number: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить транспортное средство
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
              {isLoading ? "Создание..." : "Создать декларацию"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}