"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { employeesApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import {
  MoreVertical,
  User,
  Building2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Trash2,
  Mail,
  Phone,
  Loader2,
  UserCheck,
  UserX,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const roleLabels: Record<string, string> = {
  director: "Директор",
  senior: "Старший",
  employee: "Сотрудник",
}

const roleIcons: Record<string, any> = {
  director: ShieldAlert,
  senior: ShieldCheck,
  employee: Shield,
}

export default function EmployeesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [employees, setEmployees] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showUnblockDialog, setShowUnblockDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [transferUserId, setTransferUserId] = useState<string>("")

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      const response = await employeesApi.list()
      setEmployees(response.data)
    } catch (error) {
      console.error("Failed to fetch employees:", error)
      toast.error("Ошибка при загрузке сотрудников")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlock = async () => {
    if (!selectedEmployee) return
    try {
      await employeesApi.block(selectedEmployee.user_id)
      toast.success("Сотрудник заблокирован")
      fetchEmployees()
      setShowBlockDialog(false)
    } catch (error) {
      toast.error("Ошибка при блокировке сотрудника")
    }
  }

  const handleUnblock = async () => {
    if (!selectedEmployee) return
    try {
      await employeesApi.unblock(selectedEmployee.user_id)
      toast.success("Сотрудник разблокирован")
      fetchEmployees()
      setShowUnblockDialog(false)
    } catch (error) {
      toast.error("Ошибка при разблокировке сотрудника")
    }
  }

  const handleRemove = async () => {
    if (!selectedEmployee || !transferUserId) return
    try {
      await employeesApi.remove(selectedEmployee.user_id, {
        target_user_id: parseInt(transferUserId)
      })
      toast.success("Сотрудник удален, данные перенесены")
      fetchEmployees()
      setShowRemoveDialog(false)
      setTransferUserId("")
    } catch (error) {
      toast.error("Ошибка при удалении сотрудника")
    }
  }

  const getRoleIcon = (role: string) => {
    const Icon = roleIcons[role] || Shield
    return <Icon className="h-4 w-4" />
  }

  const getStatusBadge = (isActive: boolean, isBlocked: boolean) => {
    if (isBlocked) {
      return <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" />Заблокирован</Badge>
    }
    if (!isActive) {
      return <Badge variant="secondary" className="gap-1"><UserX className="h-3 w-3" />Неактивен</Badge>
    }
    return <Badge variant="success" className="gap-1"><UserCheck className="h-3 w-3" />Активен</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Мои сотрудники</h1>
        <p className="text-muted-foreground">
          Управление сотрудниками вашей фирмы и компаний-партнеров
        </p>
      </div>

      <Accordion type="single" collapsible defaultValue="my-company" className="w-full">
        {/* My Company */}
        <AccordionItem value="my-company">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-semibold">{employees?.my_company?.name}</span>
              <Badge>Моя фирма</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {employees?.my_company?.members?.map((member: any) => {
                const RoleIcon = roleIcons[member.role] || Shield
                return (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback>
                              {member.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{member.full_name}</h3>
                              <Badge variant="outline" className="gap-1">
                                <RoleIcon className="h-3 w-3" />
                                {roleLabels[member.role] || member.role}
                              </Badge>
                              {getStatusBadge(member.is_active, member.is_blocked)}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {member.phone}
                              </span>
                            </div>
                          </div>
                        </div>

                        {user?.role === "director" && member.id !== user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Действия</DropdownMenuLabel>
                              {!member.is_blocked ? (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedEmployee(member)
                                    setShowBlockDialog(true)
                                  }}
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Заблокировать
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedEmployee(member)
                                    setShowUnblockDialog(true)
                                  }}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Разблокировать
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedEmployee(member)
                                  setShowRemoveDialog(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Partner Companies */}
        {employees?.partner_companies?.map((company: any) => (
          <AccordionItem key={company.id} value={`partner-${company.id}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">{company.name}</span>
                <Badge variant="outline">Партнер</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {company.members?.map((member: any) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>
                            {member.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{member.full_name}</h3>
                            <Badge variant="outline" className="gap-1">
                              {roleLabels[member.role] || member.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Block Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заблокировать сотрудника</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите заблокировать {selectedEmployee?.full_name}?
              Сотрудник будет немедленно выведен из системы.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleBlock}>
              Заблокировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock Dialog */}
      <Dialog open={showUnblockDialog} onOpenChange={setShowUnblockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Разблокировать сотрудника</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите разблокировать {selectedEmployee?.full_name}?
              Сотрудник сможет снова войти в систему.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnblockDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleUnblock}>
              Разблокировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Удалить сотрудника</DialogTitle>
            <DialogDescription>
              Выберите сотрудника, которому будут переданы все данные {selectedEmployee?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={transferUserId} onValueChange={setTransferUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите сотрудника" />
              </SelectTrigger>
              <SelectContent>
                {employees?.my_company?.members
                  ?.filter((m: any) => m.id !== selectedEmployee?.id)
                  .map((member: any) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.full_name} ({roleLabels[member.role]})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemove}
              disabled={!transferUserId}
            >
              Удалить и перенести данные
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}