"use client"

import { useState, useEffect } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { settingsApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  Trash2,
  Loader2,
  Save,
  Send,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"

const profileSchema = z.object({
  full_name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
})

const passwordSchema = z.object({
  old_password: z.string().min(1, "Введите старый пароль"),
  new_password: z.string().min(6, "Новый пароль должен содержать минимум 6 символов"),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Пароли не совпадают",
  path: ["confirm_password"],
})

const emailSchema = z.object({
  new_email: z.string().email("Введите корректный email"),
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>
type EmailForm = z.infer<typeof emailSchema>

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmCode, setConfirmCode] = useState("")
  const [confirmType, setConfirmType] = useState<"password" | "email">("password")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      phone: user?.phone || "",
    },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      new_email: user?.email || "",
    },
  })

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      setIsLoading(true)
      await settingsApi.updateProfile(data)
      toast.success("Профиль обновлен")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Ошибка при обновлении профиля")
    } finally {
      setIsLoading(false)
    }
  }

  const onPasswordRequest = async (data: PasswordForm) => {
    try {
      setIsLoading(true)
      await settingsApi.requestPasswordChange({
        old_password: data.old_password,
        new_password: data.new_password,
      })
      setConfirmType("password")
      setShowConfirmDialog(true)
      toast.success("Код подтверждения отправлен в Telegram")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Ошибка при запросе смены пароля")
    } finally {
      setIsLoading(false)
    }
  }

  const onEmailRequest = async (data: EmailForm) => {
    try {
      setIsLoading(true)
      await settingsApi.requestEmailChange(data)
      setConfirmType("email")
      setShowConfirmDialog(true)
      toast.success("Код подтверждения отправлен в Telegram")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Ошибка при запросе смены email")
    } finally {
      setIsLoading(false)
    }
  }

  const onConfirm = async () => {
    if (!confirmCode) return

    try {
      setIsLoading(true)
      if (confirmType === "password") {
        await settingsApi.confirmPasswordChange(confirmCode)
        toast.success("Пароль успешно изменен")
        passwordForm.reset()
      } else {
        await settingsApi.confirmEmailChange(confirmCode)
        toast.success("Email успешно изменен")
        emailForm.reset()
      }
      setShowConfirmDialog(false)
      setConfirmCode("")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Ошибка при подтверждении")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return

    try {
      setIsLoading(true)
      await settingsApi.uploadAvatar(avatarFile)
      toast.success("Аватар обновлен")
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Ошибка при загрузке аватара")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarDelete = async () => {
    try {
      setIsLoading(true)
      await settingsApi.deleteAvatar()
      toast.success("Аватар удален")
      setAvatarPreview(null)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Ошибка при удалении аватара")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">
          Управление настройками вашего профиля
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6">
            {/* Avatar */}
            <Card>
              <CardHeader>
                <CardTitle>Фото профиля</CardTitle>
                <CardDescription>
                  Загрузите или измените фото профиля
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarPreview || user?.avatar_url || ""} />
                      <AvatarFallback className="text-2xl">
                        {user?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90"
                    >
                      <Camera className="h-4 w-4" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div className="space-y-2">
                    {avatarFile && (
                      <Button
                        size="sm"
                        onClick={handleAvatarUpload}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Сохранить
                      </Button>
                    )}
                    {user?.avatar_url && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleAvatarDelete}
                        disabled={isLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle>Личная информация</CardTitle>
                <CardDescription>
                  Обновите вашу личную информацию
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Полное имя</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Телефон</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-10" placeholder="+7 (999) 999-99-99" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Сохранить изменения
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Смена пароля</CardTitle>
                <CardDescription>
                  Измените пароль для входа в систему
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordRequest)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="old_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Старый пароль</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="password" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="new_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Новый пароль</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="password" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirm_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Подтвердите пароль</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="password" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Запросить смену пароля
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Change Email */}
            <Card>
              <CardHeader>
                <CardTitle>Смена email</CardTitle>
                <CardDescription>
                  Измените email для входа в систему
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailRequest)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="new_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Новый email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="email" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Запросить смену email
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Telegram Connection */}
            <Card>
              <CardHeader>
                <CardTitle>Подключение Telegram</CardTitle>
                <CardDescription>
                  Подключите Telegram для получения уведомлений и подтверждения действий
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.telegram_chat_id ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <p className="text-sm">Telegram подключен</p>
                    </div>
                    <Button variant="outline">Отключить</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Для подключения Telegram, отправьте команду /start боту @DeclarantCRM_bot
                      и введите полученный код:
                    </p>
                    <div className="flex gap-2">
                      <Input placeholder="Введите код из Telegram" />
                      <Button>Подключить</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>
                Настройте получение уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Здесь будут настройки уведомлений */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение действия</DialogTitle>
            <DialogDescription>
              Введите код подтверждения из Telegram
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="000000"
              maxLength={6}
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading || confirmCode.length !== 6}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}