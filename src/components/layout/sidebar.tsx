"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/hooks/use-auth"
import {
  LayoutDashboard,
  FileText,
  Certificate,
  ClipboardList,
  FolderOpen,
  Users,
  Building2,
  Bell,
  Settings,
  LogOut,
  UserCircle,
  Handshake,
  MailQuestion,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isAdmin = pathname?.startsWith("/admin")
  const isDeclarant = user?.activity_type === "declarant"
  const isCertifier = user?.activity_type === "certifier"

  const adminNavItems = [
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
      icon: MailQuestion,
    },
  ]

  const declarantNavItems = [
    {
      title: "Дашборд",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Декларации",
      href: "/declarations",
      icon: FileText,
    },
    {
      title: "Сертификаты",
      href: "/certificates",
      icon: Certificate,
    },
    {
      title: "Задачи",
      href: "/tasks",
      icon: ClipboardList,
    },
    {
      title: "Документы",
      href: "/documents",
      icon: FolderOpen,
    },
    {
      title: "Клиенты",
      href: "/clients",
      icon: UserCircle,
    },
    {
      title: "Сотрудничающие компании",
      href: "/partners",
      icon: Handshake,
    },
    {
      title: "Мои сотрудники",
      href: "/employees",
      icon: Users,
    },
    {
      title: "Запросы",
      href: "/requests",
      icon: MailQuestion,
    },
  ]

  const certifierNavItems = [
    {
      title: "Дашборд",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Сертификаты",
      href: "/certificates",
      icon: Certificate,
    },
    {
      title: "Задачи",
      href: "/tasks",
      icon: ClipboardList,
    },
    {
      title: "Документы",
      href: "/documents",
      icon: FolderOpen,
    },
    {
      title: "Клиенты",
      href: "/clients",
      icon: UserCircle,
    },
    {
      title: "Сотрудничающие компании",
      href: "/partners",
      icon: Handshake,
    },
    {
      title: "Мои сотрудники",
      href: "/employees",
      icon: Users,
    },
    {
      title: "Запросы",
      href: "/requests",
      icon: MailQuestion,
    },
  ]

  const bottomNavItems = [
    {
      title: "Настройки",
      href: "/settings",
      icon: Settings,
    },
  ]

  const navItems = isAdmin
    ? adminNavItems
    : isDeclarant
    ? declarantNavItems
    : certifierNavItems

  return (
    <div className={cn("pb-12 w-64 border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-4 py-2">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {user?.full_name?.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{user?.full_name}</span>
              <span className="text-xs text-muted-foreground">
                {user?.phone}
              </span>
            </div>
          </div>
        </div>
        <div className="px-3 py-2">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              ))}
            </div>
            <div className="absolute bottom-4 left-3 right-3 space-y-1">
              {bottomNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Выход
              </Button>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}