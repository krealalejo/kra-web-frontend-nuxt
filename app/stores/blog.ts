import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNotificationStore } from './notifications'

export interface BlogPost {
  slug: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  references?: Array<{ label: string; url: string }>
  imageUrl?: string | null
}

export const useBlogStore = defineStore('blog', () => {
  const posts = ref<BlogPost[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const notifications = useNotificationStore()

  const fetchPosts = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<BlogPost[]>('/api/admin/posts')
      posts.value = response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load posts'
      notifications.add({ type: 'error', title: 'Error loading posts', message: error.value })
    } finally {
      loading.value = false
    }
  }

  const createPost = async (data: { slug: string; title: string; content: string; references?: Array<{ label: string; url: string }>; imageUrl?: string | null }): Promise<BlogPost> => {
    loading.value = true
    error.value = null
    try {
      const created = await $fetch<BlogPost>('/api/admin/posts', {
        method: 'POST',
        body: data,
      })
      posts.value.unshift(created)
      return created
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to create post'
      notifications.add({ type: 'error', title: 'Creation failed', message: error.value })
      throw e
    } finally {
      loading.value = false
    }
  }

  const updatePost = async (slug: string, data: { title: string; content: string; references?: Array<{ label: string; url: string }>; imageUrl?: string | null }): Promise<BlogPost> => {
    loading.value = true
    error.value = null
    try {
      const updated = await $fetch<BlogPost>(`/api/admin/posts/${slug}`, {
        method: 'PUT',
        body: data,
      })
      const index = posts.value.findIndex(p => p.slug === slug)
      if (index >= 0) posts.value[index] = updated
      return updated
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to update post'
      notifications.add({ type: 'error', title: 'Update failed', message: error.value })
      throw e
    } finally {
      loading.value = false
    }
  }

  const deletePost = async (slug: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/admin/posts/${slug}`, {
        method: 'DELETE',
      })
      posts.value = posts.value.filter(p => p.slug !== slug)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to delete post'
      notifications.add({ type: 'error', title: 'Deletion failed', message: error.value })
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
  }
})
