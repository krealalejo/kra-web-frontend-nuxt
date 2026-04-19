import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBlogStore } from './blog'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('useBlogStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
  })

  describe('initial state', () => {
    it('starts with empty posts array', () => {
      const store = useBlogStore()
      expect(store.posts).toEqual([])
    })

    it('starts with loading false', () => {
      const store = useBlogStore()
      expect(store.loading).toBe(false)
    })

    it('starts with error null', () => {
      const store = useBlogStore()
      expect(store.error).toBeNull()
    })
  })

  describe('fetchPosts', () => {
    it('sets loading true while fetching', async () => {
      const store = useBlogStore()
      mockFetch.mockResolvedValue([])
      const promise = store.fetchPosts()
      expect(store.loading).toBe(true)
      await promise
    })

    it('sets posts on success', async () => {
      const store = useBlogStore()
      const mockPosts = [
        { slug: 'post-1', title: 'Post 1', content: '', createdAt: '', updatedAt: '' },
      ]
      mockFetch.mockResolvedValue(mockPosts)
      await store.fetchPosts()
      expect(store.posts).toEqual(mockPosts)
    })

    it('sets loading false after success', async () => {
      const store = useBlogStore()
      mockFetch.mockResolvedValue([])
      await store.fetchPosts()
      expect(store.loading).toBe(false)
    })

    it('sets error on failure', async () => {
      const store = useBlogStore()
      mockFetch.mockRejectedValue(new Error('Network error'))
      await store.fetchPosts()
      expect(store.error).toBe('Network error')
    })

    it('sets loading false after failure', async () => {
      const store = useBlogStore()
      mockFetch.mockRejectedValue(new Error('Network error'))
      await store.fetchPosts()
      expect(store.loading).toBe(false)
    })

    it('sets fallback error string when thrown value is not an Error', async () => {
      const store = useBlogStore()
      mockFetch.mockRejectedValue('string-error')
      await store.fetchPosts()
      expect(store.error).toBe('Failed to load posts')
    })
  })

  describe('createPost', () => {
    it('calls POST /api/admin/posts', async () => {
      const store = useBlogStore()
      const newPost = { slug: 'new', title: 'New', content: '' }
      mockFetch.mockResolvedValue({ ...newPost, createdAt: '', updatedAt: '' })
      await store.createPost(newPost)
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/posts', {
        method: 'POST',
        body: newPost,
      })
    })

    it('prepends created post to posts array', async () => {
      const store = useBlogStore()
      const newPost = { slug: 'new', title: 'New', content: '', createdAt: '', updatedAt: '' }
      mockFetch.mockResolvedValue(newPost)
      await store.createPost({ slug: 'new', title: 'New', content: '' })
      expect(store.posts[0]).toEqual(newPost)
    })

    it('throws and sets error on failure', async () => {
      const store = useBlogStore()
      mockFetch.mockRejectedValue(new Error('Create failed'))
      await expect(store.createPost({ slug: 'x', title: 'X', content: '' })).rejects.toThrow()
      expect(store.error).toBe('Create failed')
    })

    it('sets fallback error string when thrown value is not an Error', async () => {
      const store = useBlogStore()
      mockFetch.mockRejectedValue(42)
      await expect(store.createPost({ slug: 'x', title: 'X', content: '' })).rejects.toBeDefined()
      expect(store.error).toBe('Failed to create post')
    })
  })

  describe('updatePost', () => {
    it('calls PUT /api/admin/posts/{slug}', async () => {
      const store = useBlogStore()
      store.posts = [{ slug: 'old', title: 'Old', content: '', createdAt: '', updatedAt: '' }]
      mockFetch.mockResolvedValue({ slug: 'old', title: 'Updated', content: '', createdAt: '', updatedAt: '' })
      await store.updatePost('old', { title: 'Updated', content: '' })
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/posts/old', {
        method: 'PUT',
        body: { title: 'Updated', content: '' },
      })
    })

    it('updates post in array', async () => {
      const store = useBlogStore()
      store.posts = [{ slug: 'post', title: 'Old', content: '', createdAt: '', updatedAt: '' }]
      mockFetch.mockResolvedValue({ slug: 'post', title: 'New', content: 'new', createdAt: '', updatedAt: '' })
      await store.updatePost('post', { title: 'New', content: 'new' })
      expect(store.posts[0].title).toBe('New')
    })

    it('does not crash when updated post slug is not in the local array', async () => {
      const store = useBlogStore()
      store.posts = []
      mockFetch.mockResolvedValue({ slug: 'ghost', title: 'Ghost', content: '', createdAt: '', updatedAt: '' })
      const result = await store.updatePost('ghost', { title: 'Ghost', content: '' })
      expect(result.slug).toBe('ghost')
    })

    it('throws and sets error message on Error failure', async () => {
      const store = useBlogStore()
      mockFetch.mockRejectedValue(new Error('Update failed'))
      await expect(store.updatePost('x', { title: 'X', content: '' })).rejects.toThrow()
      expect(store.error).toBe('Update failed')
    })

    it('sets fallback error string when thrown value is not an Error', async () => {
      const store = useBlogStore()
      mockFetch.mockRejectedValue('string-error')
      await expect(store.updatePost('x', { title: 'X', content: '' })).rejects.toBeDefined()
      expect(store.error).toBe('Failed to update post')
    })
  })

  describe('deletePost', () => {
    it('calls DELETE /api/admin/posts/{slug}', async () => {
      const store = useBlogStore()
      store.posts = [{ slug: 'to-delete', title: 'T', content: '', createdAt: '', updatedAt: '' }]
      mockFetch.mockResolvedValue(undefined)
      await store.deletePost('to-delete')
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/posts/to-delete', {
        method: 'DELETE',
      })
    })

    it('removes post from array', async () => {
      const store = useBlogStore()
      store.posts = [
        { slug: 'keep', title: 'Keep', content: '', createdAt: '', updatedAt: '' },
        { slug: 'delete', title: 'Delete', content: '', createdAt: '', updatedAt: '' },
      ]
      mockFetch.mockResolvedValue(undefined)
      await store.deletePost('delete')
      expect(store.posts).toHaveLength(1)
      expect(store.posts[0].slug).toBe('keep')
    })

    it('throws and sets error message on Error failure', async () => {
      const store = useBlogStore()
      mockFetch.mockRejectedValue(new Error('Delete failed'))
      await expect(store.deletePost('x')).rejects.toThrow()
      expect(store.error).toBe('Delete failed')
    })

    it('sets fallback error string when thrown value is not an Error', async () => {
      const store = useBlogStore()
      mockFetch.mockRejectedValue({ code: 500 })
      await expect(store.deletePost('x')).rejects.toBeDefined()
      expect(store.error).toBe('Failed to delete post')
    })
  })
})
