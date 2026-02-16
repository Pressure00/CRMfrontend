"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Building2, Lock, Mail, User } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
})

const adminLoginSchema = z.object({
  login: z.string().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
  code: z.string().length(6, "Код должен содержать 6 цифр"),
})

type LoginForm = z.infer<typeof loginSchema>
type AdminLoginForm = z.infer<typeof adminLoginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, adminLogin, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user")

  // User login form
  const {
    register: registerUser,
    handleSubmit: handleUserSubmit,
    formState: { errors: userErrors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  // Admin login form
  const {
    register: registerAdmin,
    handleSubmit: handleAdminSubmit,
    formState: { errors: adminErrors },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  })

  const onUserSubmit = async (data: LoginForm) => {
    try {
      await login(data)
    } catch (error) {
      // Error handled in hook
    }
  }

  const onAdminSubmit = async (data: AdminLoginForm) => {
    try {
      await adminLogin(data)
    } catch (error) {
      // Error handled in hook
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Declarant CRM</CardTitle>
          <CardDescription className="text-center">
            Войдите в систему управления декларациями и сертификатами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "user" | "admin")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user">Пользователь</TabsTrigger>
              <TabsTrigger value="admin">Администратор</TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleUserSubmit(onUserSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Электронная почта</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ivan@example.com"
                      className="pl-10"
                      {...registerUser("email")}
                    />
                  </div>
                  {userErrors.email && (
                    <p className="text-sm text-destructive">{userErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      {...registerUser("password")}
                    />
                  </div>
                  {userErrors.password && (
                    <p className="text-sm text-destructive">{userErrors.password.message}</p>
                  )}
                </div>

                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Забыли пароль?
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Вход..." : "Войти"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={handleAdminSubmit(onAdminSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Логин</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login"
                      placeholder="admin"
                      className="pl-10"
                      {...registerAdmin("login")}
                    />
                  </div>
                  {adminErrors.login && (
                    <p className="text-sm text-destructive">{adminErrors.login.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      {...registerAdmin("password")}
                    />
                  </div>
                  {adminErrors.password && (
                    <p className="text-sm text-destructive">{adminErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Код из Telegram</Label>
                  <Input
                    id="code"
                    placeholder="000000"
                    maxLength={6}
                    {...registerAdmin("code")}
                  />
                  {adminErrors.code && (
                    <p className="text-sm text-destructive">{adminErrors.code.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Вход..." : "Войти как администратор"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}