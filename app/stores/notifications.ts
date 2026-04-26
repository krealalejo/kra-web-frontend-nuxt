import { defineStore } from 'pinia'
import { ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title?: string
  message: string
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])

  function add(n: Omit<Notification, 'id'>) {
    const id = crypto.randomUUID()
    notifications.value.push({ ...n, id })

    setTimeout(() => {
      remove(id)
    }, 5000)
  }

  function remove(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications,
    add,
    remove,
  }
})
