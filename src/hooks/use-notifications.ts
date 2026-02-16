import { useEffect } from "react"
import { create } from "zustand"
import { notificationsApi } from "@/lib/api/endpoints"
import { NotificationResponse } from "@/types"
import { toast } from "sonner"
import { useAuth } from "./use-auth"

interface NotificationsState {
  notifications: NotificationResponse[]
  unreadCount: number
  soundEnabled: boolean
  isLoading: boolean
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (ids?: number[]) => Promise<void>
  markSingleAsRead: (id: number) => Promise<void>
  deleteNotification: (id: number) => Promise<void>
  clearAll: () => Promise<void>
  toggleSound: () => Promise<void>
  fetchSoundStatus: () => Promise<void>
  playSound: () => void
}

const notificationSound = typeof Audio !== "undefined" 
  ? new Audio("/sounds/notification.mp3")
  : null

export const useNotifications = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  soundEnabled: true,
  isLoading: false,

  fetchNotifications: async (unreadOnly = false) => {
    try {
      set({ isLoading: true })
      const response = await notificationsApi.get({ unread_only: unreadOnly })
      set({ notifications: response.data.notifications || [] })
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationsApi.getUnreadCount()
      set({ unreadCount: response.data.count || 0 })
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    }
  },

  markAsRead: async (ids?: number[]) => {
    try {
      await notificationsApi.markRead({ notification_ids: ids })
      
      if (ids) {
        // Mark specific notifications as read
        set((state) => ({
          notifications: state.notifications.map((n) =>
            ids.includes(n.id) ? { ...n, is_read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - ids.length),
        }))
      } else {
        // Mark all as read
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
          unreadCount: 0,
        }))
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  },

  markSingleAsRead: async (id: number) => {
    try {
      await notificationsApi.markSingleRead(id)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  },

  deleteNotification: async (id: number) => {
    try {
      await notificationsApi.delete(id)
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id)
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: notification && !notification.is_read
            ? state.unreadCount - 1
            : state.unreadCount,
        }
      })
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  },

  clearAll: async () => {
    try {
      await notificationsApi.clearAll()
      set({ notifications: [], unreadCount: 0 })
    } catch (error) {
      console.error("Failed to clear notifications:", error)
    }
  },

  toggleSound: async () => {
    try {
      const newState = !get().soundEnabled
      await notificationsApi.toggleSound({ enabled: newState })
      set({ soundEnabled: newState })
    } catch (error) {
      console.error("Failed to toggle sound:", error)
    }
  },

  fetchSoundStatus: async () => {
    try {
      const response = await notificationsApi.getSoundStatus()
      set({ soundEnabled: response.data.enabled })
    } catch (error) {
      console.error("Failed to fetch sound status:", error)
    }
  },

  playSound: () => {
    const { soundEnabled } = get()
    if (soundEnabled && notificationSound) {
      notificationSound.play().catch(() => {
        // Ignore autoplay errors
      })
    }
  },
}))

// Hook for real-time notifications (SSE or polling)
export function useNotificationPolling(interval = 30000) {
  const { user } = useAuth()
  const { fetchUnreadCount, fetchNotifications, playSound } = useNotifications()

  useEffect(() => {
    if (!user) return

    let lastUnreadCount = 0

    const poll = async () => {
      await fetchUnreadCount()
      const currentUnreadCount = useNotifications.getState().unreadCount
      
      if (currentUnreadCount > lastUnreadCount) {
        playSound()
        await fetchNotifications(true)
      }
      
      lastUnreadCount = currentUnreadCount
    }

    // Initial fetch
    poll()

    // Set up polling
    const intervalId = setInterval(poll, interval)

    return () => clearInterval(intervalId)
  }, [user, interval, fetchUnreadCount, fetchNotifications, playSound])
}