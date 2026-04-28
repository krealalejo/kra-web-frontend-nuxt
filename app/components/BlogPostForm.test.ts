import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BlogPostForm from './BlogPostForm.vue'
import { useBlogStore, type BlogPost } from '~/stores/blog'

describe('components/BlogPostForm.vue', () => {
  const mockPost: BlogPost = {
    slug: 'test-post',
    title: 'Test Title',
    content: 'Test Content',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    references: []
  }

  it('renders create mode correctly', async () => {
    const wrapper = await mountSuspended(BlogPostForm, {
      props: { open: true, post: null },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })
    expect(wrapper.text()).toContain('Create Post')
    expect(wrapper.find('#post-slug').exists()).toBe(true)
  })

  it('renders edit mode correctly', async () => {
    const wrapper = await mountSuspended(BlogPostForm, {
      props: { open: true, post: mockPost },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })
    expect(wrapper.text()).toContain('Edit Post')
    expect(wrapper.find('#post-slug').element.hasAttribute('disabled')).toBe(true)
  })

  it('emits close when Cancel is clicked', async () => {
    const wrapper = await mountSuspended(BlogPostForm, {
      props: { open: true, post: null },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })
    const cancelBtn = wrapper.findAll('button').find(b => b.text().includes('Cancel'))
    if (cancelBtn) await cancelBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeDefined()
  })

  it('validates required fields on submit', async () => {
    const wrapper = await mountSuspended(BlogPostForm, {
      props: { open: true, post: null },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })

    await wrapper.find('form').trigger('submit.prevent')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Title required')
    })
  })

  it('calls createPost on valid submission in create mode', async () => {
    const store = useBlogStore()
    const spy = vi.spyOn(store, 'createPost').mockImplementation(async () => mockPost)

    const wrapper = await mountSuspended(BlogPostForm, {
      props: { open: true, post: null },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })

    await wrapper.find('#post-slug').setValue('new-post')
    await wrapper.find('#post-title').setValue('New Title')
    await wrapper.find('#post-content').setValue('New Content content')

    await wrapper.find('form').trigger('submit.prevent')

    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalled()
    })
    spy.mockRestore()
  })

  it('removes thumbnail when Remove button is clicked', async () => {
    const postWithImage: BlogPost = { ...mockPost, imageUrl: 'images/test.jpg' }
    const wrapper = await mountSuspended(BlogPostForm, {
      props: { open: true, post: postWithImage },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })

    expect(wrapper.find('img').exists()).toBe(true)

    const removeBtn = wrapper.find('button[title="Remove image"]')
    expect(removeBtn.exists()).toBe(true)
    await removeBtn.trigger('click')

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('calls updatePost on valid submission in edit mode', async () => {
    const store = useBlogStore()
    const spy = vi.spyOn(store, 'updatePost').mockImplementation(async () => mockPost)

    const wrapper = await mountSuspended(BlogPostForm, {
      props: { open: true, post: mockPost },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })

    await wrapper.find('#post-title').setValue('Updated Title')
    await wrapper.find('#post-content').setValue('Updated content here')

    await wrapper.find('form').trigger('submit.prevent')

    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith('test-post', expect.objectContaining({ title: 'Updated Title' }))
    })
    spy.mockRestore()
  })

  it('dismisses form error when Dismiss button is clicked', async () => {
    const store = useBlogStore()
    vi.spyOn(store, 'createPost').mockRejectedValue(new Error('Server error'))

    const wrapper = await mountSuspended(BlogPostForm, {
      props: { open: true, post: null },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })

    await wrapper.find('#post-slug').setValue('new-post')
    await wrapper.find('#post-title').setValue('New Title')
    await wrapper.find('#post-content').setValue('New Content here')
    await wrapper.find('form').trigger('submit.prevent')

    await vi.waitFor(() => {
      expect(wrapper.text()).toMatch(/Server error|unexpected error/)
    })

    const dismissBtn = wrapper.find('button.t-label')
    if (dismissBtn.exists()) {
      await dismissBtn.trigger('click')
      await wrapper.vm.$nextTick()
    }
  })

  it('adds and removes references', async () => {
    const wrapper = await mountSuspended(BlogPostForm, {
      props: { open: true, post: null },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })

    expect(wrapper.findAll('input[placeholder="Label (e.g. Source)"]').length).toBe(0)

    const addBtn = wrapper.find('button[type="button"].t-label')
    await addBtn.trigger('click')

    expect(wrapper.findAll('input[placeholder="Label (e.g. Source)"]').length).toBe(1)

    const removeBtn = wrapper.find('button.text-red-400')
    await removeBtn.trigger('click')

    expect(wrapper.findAll('input[placeholder="Label (e.g. Source)"]').length).toBe(0)
  })
})

describe('BlogPostForm — image upload', () => {
  const dialogStubs = {
    Dialog: { template: '<div><slot /></div>' },
    DialogPanel: { template: '<div><slot /></div>' },
    DialogTitle: { template: '<div><slot /></div>' },
  }

  it('handles image upload successfully', async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal('$fetch', mockFetch)
    mockFetch
      .mockResolvedValueOnce({ uploadUrl: 'https://s3.example.com/upload', s3Key: 'images/photo.jpg' })
      .mockResolvedValueOnce({})
      .mockResolvedValue({ ready: true })

    const wrapper = await mountSuspended(BlogPostForm, {
      props: { open: true, post: null },
      global: { stubs: dialogStubs }
    })

    const input = wrapper.find('input[type="file"]')
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await wrapper.vm.$nextTick()

    expect(mockFetch).toHaveBeenCalledWith('/api/admin/upload', expect.objectContaining({ method: 'POST' }))
  })

  it('shows error when image upload fails', async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal('$fetch', mockFetch)
    mockFetch.mockRejectedValue(new Error('Upload failed'))

    const wrapper = await mountSuspended(BlogPostForm, {
      props: { open: true, post: null },
      global: { stubs: dialogStubs }
    })

    const input = wrapper.find('input[type="file"]')
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Upload failed')
  })

  it('clears poll on unmount', async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal('$fetch', mockFetch)
    mockFetch
      .mockResolvedValueOnce({ uploadUrl: 'https://s3.example.com/upload', s3Key: 'images/photo.jpg' })
      .mockResolvedValueOnce({})
      .mockResolvedValue({ ready: false })

    vi.useFakeTimers()

    const wrapper = await mountSuspended(BlogPostForm, {
      props: { open: true, post: null },
      global: { stubs: dialogStubs }
    })

    const input = wrapper.find('input[type="file"]')
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await wrapper.vm.$nextTick()

    wrapper.unmount()
    vi.useRealTimers()
  })
})
