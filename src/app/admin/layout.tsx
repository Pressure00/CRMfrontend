"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, LayoutDashboard, Building2, Users, Mail, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Дашборд",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Фирмы",
    href: "/admin/companies",
    icon: Building2,
  },
  {
    title: "Пользователи",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Запросы",
    href: "/admin/requests",
    icon: Mail,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAdmin, isLoading, logout, checkAuth } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/login")
    }
  }, [isLoading, isAdmin, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r bg-card min-h-screen fixed">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">Управление системой</p>
          </div>
          
          <nav className="space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  window.location.pathname === item.href && "bg-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Выход
            </Button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 ml-64">
          <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
            <div className="flex h-14 items-center px-6">
              <h1 className="text-lg font-semibold">Админ панель</h1>
              <div className="flex-1" />
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user?.full_name}
                </span>
              </div>
            </div>
          </header>
          
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}