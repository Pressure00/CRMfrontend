"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Volume2, VolumeX } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationsPopover } from "@/components/notifications/notifications-popover"

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { unreadCount, soundEnabled, toggleSound } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname?.startsWith("/admin")) return "Админ панель"
    if (pathname?.startsWith("/dashboard")) return "Дашборд"
    if (pathname?.startsWith("/declarations")) return "Декларации"
    if (pathname?.startsWith("/certificates")) return "Сертификаты"
    if (pathname?.startsWith("/tasks")) return "Задачи"
    if (pathname?.startsWith("/documents")) return "Документы"
    if (pathname?.startsWith("/clients")) return "Клиенты"
    if (pathname?.startsWith("/partners")) return "Сотрудничающие компании"
    if (pathname?.startsWith("/employees")) return "Мои сотрудники"
    if (pathname?.startsWith("/requests")) return "Запросы"
    if (pathname?.startsWith("/settings")) return "Настройки"
    return "Declarant CRM"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-6">
        <div className="flex flex-1 items-center justify-between">
          <h2 className="text-lg font-semibold">{getPageTitle()}</h2>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={toggleSound}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>

            <NotificationsPopover>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </NotificationsPopover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name} />
                    <AvatarFallback>
                      {user?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.full_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">Настройки</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">Профиль</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={logout}
                >
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}