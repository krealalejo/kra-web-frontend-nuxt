import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ActivityCard {
  type: string
  title: string | null
  description: string | null
  tags?: string[] | null
}

export const useActivityStore = defineStore('activity', () => {
  const cards = ref<ActivityCard[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCards = async () => {
    loading.value = true
    error.value = null
    try {
      const config = useRuntimeConfig()
      const apiBase = (config.public.apiBase as string).replace(/\/$/, '')
      const response = await $fetch<ActivityCard[]>(`${apiBase}/activity`)
      cards.value = response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load activity cards'
    } finally {
      loading.value = false
    }
  }

  const updateCard = async (
    type: string,
    data: { title?: string | null; description?: string | null; tags?: string[] | null }
  ): Promise<ActivityCard> => {
    loading.value = true
    error.value = null
    try {
      const updated = await $fetch<ActivityCard>(`/api/admin/activity/${type}`, {
        method: 'PUT',
        body: data,
      })
      const idx = cards.value.findIndex((c) => c.type === type)
      if (idx !== -1) cards.value[idx] = updated
      return updated
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to update activity card'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { cards, loading, error, fetchCards, updateCard }
})
