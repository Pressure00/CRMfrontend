"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { documentsApi } from "@/lib/api/endpoints"
import { useAuth } from "@/hooks/use-auth"
import {
  Plus,
  Search,
  FolderOpen,
  FileText,
  MoreVertical,
  Upload,
  Download,
  Trash2,
  Move,
  User,
  Users,
  Lock,
  Globe,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function DocumentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"files" | "folders">("folders")
  const [folders, setFolders] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<any>(null)
  const [searchParams, setSearchParams] = useState({
    folder_id: "",
    client_id: "",
    user_id: "",
    filename: "",
  })

  useEffect(() => {
    fetchData()
  }, [activeTab, searchParams])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      if (activeTab === "folders") {
        const params: any = {}
        if (searchParams.client_id) params.client_id = parseInt(searchParams.client_id)
        if (searchParams.user_id) params.user_id = parseInt(searchParams.user_id)
        
        const response = await documentsApi.listFolders(params)
        setFolders(response.data)
      } else {
        const params: any = {}
        if (searchParams.folder_id) params.folder_id = parseInt(searchParams.folder_id)
        if (searchParams.client_id) params.client_id = parseInt(searchParams.client_id)
        if (searchParams.user_id) params.user_id = parseInt(searchParams.user_id)
        if (searchParams.filename) params.filename = searchParams.filename
        
        const response = await documentsApi.listDocuments(params)
        setDocuments(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Ошибка при загрузке данных")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFolder = async (folderId: number) => {
    try {
      await documentsApi.deleteFolder(folderId)
      toast.success("Папка удалена")
      fetchData()
    } catch (error) {
      toast.error("Ошибка при удалении папки")
    }
  }

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await documentsApi.deleteDocument(documentId)
      toast.success("Документ удален")
      fetchData()
    } catch (error) {
      toast.error("Ошибка при удалении документа")
    }
  }

  const getAccessTypeIcon = (type: string) => {
    switch (type) {
      case "private":
        return <Lock className="h-4 w-4" />
      case "public":
        return <Globe className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getAccessTypeLabel = (type: string) => {
    switch (type) {
      case "private":
        return "Приватная"
      case "public":
        return "Публичная"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Документы</h1>
          <p className="text-muted-foreground">
            Управление файлами и папками
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowNewFolderDialog(true)}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Новая папка
          </Button>
          <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Загрузить файлы
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
          <CardDescription>
            Найдите документы по различным параметрам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Папка</label>
              <Select
                value={searchParams.folder_id}
                onValueChange={(value) => setSearchParams({
                  ...searchParams,
                  folder_id: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите папку" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все папки</SelectItem>
                  <SelectItem value="root">Корневая папка</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Клиент</label>
              <Select
                value={searchParams.client_id}
                onValueChange={(value) => setSearchParams({
                  ...searchParams,
                  client_id: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все клиенты</SelectItem>
                  {/* Здесь будет список клиентов */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Сотрудник</label>
              <Select
                value={searchParams.user_id}
                onValueChange={(value) => setSearchParams({
                  ...searchParams,
                  user_id: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сотрудника" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все сотрудники</SelectItem>
                  {/* Здесь будет список сотрудников */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Название файла</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск..."
                  className="pl-10"
                  value={searchParams.filename}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    filename: e.target.value
                  })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "files" | "folders")}>
        <TabsList>
          <TabsTrigger value="folders">Папки</TabsTrigger>
          <TabsTrigger value="files">Файлы</TabsTrigger>
        </TabsList>

        <TabsContent value="folders" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium">Папки не найдены</p>
              <p className="text-sm text-muted-foreground">
                Создайте первую папку для организации документов
              </p>
              <Button className="mt-4" onClick={() => setShowNewFolderDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Создать папку
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setSelectedFolder(folder)
                    setActiveTab("files")
                    setSearchParams({ ...searchParams, folder_id: folder.id.toString() })
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{folder.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getAccessTypeIcon(folder.access_type)}
                            <span className="text-xs text-muted-foreground">
                              {getAccessTypeLabel(folder.access_type)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/documents/folders/${folder.id}`)
                          }}>
                            Открыть
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            // Handle edit
                          }}>
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteFolder(folder.id)
                            }}
                          >
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{folder.documents_count || 0} файлов</span>
                      <span>•</span>
                      <span>{folder.subfolders_count || 0} папок</span>
                    </div>
                    {folder.client_name && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Клиент: {folder.client_name}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium">Файлы не найдены</p>
              <p className="text-sm text-muted-foreground">
                Загрузите первый файл для работы
              </p>
              <Button className="mt-4" onClick={() => setShowUploadDialog(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Загрузить файлы
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="divide-y">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.original_filename}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{(doc.file_size / 1024).toFixed(2)} KB</span>
                          <span>•</span>
                          <span>{doc.mime_type}</span>
                          <span>•</span>
                          <span>
                            {format(new Date(doc.created_at), "dd.MM.yyyy HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.user_name && (
                        <Badge variant="outline" className="gap-1">
                          <User className="h-3 w-3" />
                          {doc.user_name}
                        </Badge>
                      )}
                      {doc.client_name && (
                        <Badge variant="outline" className="gap-1">
                          {doc.client_name}
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Скачать
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Move className="mr-2 h-4 w-4" />
                            Переместить
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новую папку</DialogTitle>
            <DialogDescription>
              Заполните информацию для создания папки
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название папки</label>
              <Input placeholder="Введите название папки" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Тип доступа</label>
              <Select defaultValue="public">
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип доступа" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Публичный</SelectItem>
                  <SelectItem value="private">Приватный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Родительская папка</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите папку" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Корневая папка</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Отмена
            </Button>
            <Button>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Загрузить файлы</DialogTitle>
            <DialogDescription>
              Выберите файлы для загрузки
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Перетащите файлы сюда или нажмите для выбора
              </p>
              <Button variant="outline" size="sm">
                Выбрать файлы
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Папка для загрузки</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите папку" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Корневая папка</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Отмена
            </Button>
            <Button>Загрузить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}