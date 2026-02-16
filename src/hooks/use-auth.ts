import { useEffect } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/endpoints"
import { User, LoginRequest, RegisterRequest } from "@/types"
import { toast } from "sonner"

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAdmin: boolean
  login: (data: LoginRequest) => Promise<void>
  adminLogin: (data: any) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAdmin: false,

      login: async (data) => {
        try {
          set({ isLoading: true })
          const response = await authApi.login(data)
          const { access_token, user_id, is_admin } = response.data

          localStorage.setItem("access_token", access_token)
          set({ token: access_token, isAdmin: is_admin })

          // Get user data
          const userResponse = await authApi.getMe()
          set({ user: userResponse.data })

          toast.success("Успешный вход в систему")

          // Redirect based on role
          if (is_admin) {
            window.location.href = "/admin/dashboard"
          } else {
            // Check company status
            const statusResponse = await authApi.getCompanyStatus()
            if (statusResponse.data === "need_setup") {
              window.location.href = "/company-setup"
            } else {
              window.location.href = "/dashboard"
            }
          }
        } catch (error: any) {
          toast.error(error.response?.data?.detail || "Ошибка входа")
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      adminLogin: async (data) => {
        try {
          set({ isLoading: true })
          const response = await authApi.adminLogin(data)
          const { access_token, user_id, is_admin } = response.data

          localStorage.setItem("access_token", access_token)
          set({ token: access_token, isAdmin: is_admin })

          toast.success("Успешный вход в админ панель")
          window.location.href = "/admin/dashboard"
        } catch (error: any) {
          toast.error(error.response?.data?.detail || "Ошибка входа")
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true })
          const response = await authApi.register(data)
          
          toast.success("Регистрация успешна")
          window.location.href = "/company-setup"
        } catch (error: any) {
          toast.error(error.response?.data?.detail || "Ошибка регистрации")
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          localStorage.removeItem("access_token")
          set({ user: null, token: null, isAdmin: false })
          window.location.href = "/login"
        } catch (error) {
          console.error("Logout error:", error)
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem("access_token")
        if (!token) {
          set({ user: null, token: null })
          return
        }

        try {
          set({ isLoading: true })
          const response = await authApi.getMe()
          set({ user: response.data, token })
        } catch (error) {
          localStorage.removeItem("access_token")
          set({ user: null, token: null })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, isAdmin: state.isAdmin }),
    }
  )
)

// Hook for protecting routes
export function useRequireAuth(redirectTo = "/login") {
  const router = useRouter()
  const { user, token, isLoading, checkAuth } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!isLoading && !token) {
      router.push(redirectTo)
    }
  }, [isLoading, token, router, redirectTo])

  return { user, isLoading, isAuthenticated: !!token }
}