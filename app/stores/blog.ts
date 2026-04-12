import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface BlogPost {
  slug: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export const useBlogStore = defineStore('blog', () => {
  const posts = ref<BlogPost[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPosts = async () => {
    loading.value = true
    error.value = null
    try {
      const config = useRuntimeConfig()
      const response = await $fetch<BlogPost[]>('/posts', {
        baseURL: config.public.apiBase,
        credentials: 'include',
      })
      posts.value = response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load posts'
    } finally {
      loading.value = false
    }
  }

  const createPost = async (data: { slug: string; title: string; content: string }): Promise<BlogPost> => {
    loading.value = true
    error.value = null
    try {
      const config = useRuntimeConfig()
      const created = await $fetch<BlogPost>('/posts', {
        method: 'POST',
        baseURL: config.public.apiBase,
        body: data,
        credentials: 'include',
      })
      posts.value.unshift(created)
      return created
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to create post'
      throw e
    } finally {
      loading.value = false
    }
  }

  const updatePost = async (slug: string, data: { title: string; content: string }): Promise<BlogPost> => {
    loading.value = true
    error.value = null
    try {
      const config = useRuntimeConfig()
      const updated = await $fetch<BlogPost>(`/posts/${slug}`, {
        method: 'PUT',
        baseURL: config.public.apiBase,
        body: data,
        credentials: 'include',
      })
      const index = posts.value.findIndex(p => p.slug === slug)
      if (index >= 0) posts.value[index] = updated
      return updated
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to update post'
      throw e
    } finally {
      loading.value = false
    }
  }

  const deletePost = async (slug: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const config = useRuntimeConfig()
      await $fetch(`/posts/${slug}`, {
        method: 'DELETE',
        baseURL: config.public.apiBase,
        credentials: 'include',
      })
      posts.value = posts.value.filter(p => p.slug !== slug)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to delete post'
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
