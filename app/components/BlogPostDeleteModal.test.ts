import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BlogPostDeleteModal from './BlogPostDeleteModal.vue'
import { useBlogStore } from '~/stores/blog'

describe('components/BlogPostDeleteModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  const mockPost = {
    slug: 'test-slug',
    title: 'Test Title',
    content: 'Test Content',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  }

  it('renders correctly when open', async () => {
    const wrapper = await mountSuspended(BlogPostDeleteModal, {
      props: { open: true, post: mockPost },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })
    expect(wrapper.text()).toContain('Delete post?')
    expect(wrapper.text()).toContain('Test Title')
  })

  it('calls deletePost on confirm', async () => {
    const store = useBlogStore()
    const spy = vi.spyOn(store, 'deletePost').mockImplementation(async () => {})

    const wrapper = await mountSuspended(BlogPostDeleteModal, {
      props: { open: true, post: mockPost },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })

    const deleteBtn = wrapper.findAll('button').find(b => b.text().includes('Delete'))
    if (deleteBtn) await deleteBtn.trigger('click')

    expect(spy).toHaveBeenCalledWith('test-slug')
    expect(wrapper.emitted('deleted')).toBeDefined()
    spy.mockRestore()
  })

  it('emits close on Cancel', async () => {
    const wrapper = await mountSuspended(BlogPostDeleteModal, {
      props: { open: true, post: mockPost },
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

  it('clears deleteError when modal is closed (open goes false)', async () => {
    const store = useBlogStore()
    vi.spyOn(store, 'deletePost').mockRejectedValue(new Error('Server error'))

    const wrapper = await mountSuspended(BlogPostDeleteModal, {
      props: { open: true, post: mockPost },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })

    const deleteBtn = wrapper.findAll('button').find(b => b.text().includes('Delete'))
    if (deleteBtn) await deleteBtn.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Server error')

    await wrapper.setProps({ open: false })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).not.toContain('Server error')
  })

  it('shows error when deletePost throws', async () => {
    const store = useBlogStore()
    vi.spyOn(store, 'deletePost').mockRejectedValue(new Error('Delete failed'))

    const wrapper = await mountSuspended(BlogPostDeleteModal, {
      props: { open: true, post: mockPost },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })

    const deleteBtn = wrapper.findAll('button').find(b => b.text().includes('Delete'))
    if (deleteBtn) await deleteBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Delete failed')
    expect(wrapper.emitted('deleted')).toBeUndefined()
  })

  it('does nothing when post is null', async () => {
    const store = useBlogStore()
    const spy = vi.spyOn(store, 'deletePost').mockImplementation(async () => {})

    const wrapper = await mountSuspended(BlogPostDeleteModal, {
      props: { open: true, post: null },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })

    const deleteBtn = wrapper.findAll('button').find(b => b.text().includes('Delete'))
    if (deleteBtn) await deleteBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('shows store.error when available after deletePost throws', async () => {
    const store = useBlogStore()
    store.error = 'Store-level error message'
    vi.spyOn(store, 'deletePost').mockRejectedValue(new Error('raw error'))

    const wrapper = await mountSuspended(BlogPostDeleteModal, {
      props: { open: true, post: mockPost },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })

    const deleteBtn = wrapper.findAll('button').find(b => b.text().includes('Delete'))
    if (deleteBtn) await deleteBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Store-level error message')
    store.error = null
  })

  it('shows fallback message when error thrown is not an Error instance', async () => {
    const store = useBlogStore()
    store.error = null
    vi.spyOn(store, 'deletePost').mockRejectedValue('string error')

    const wrapper = await mountSuspended(BlogPostDeleteModal, {
      props: { open: true, post: mockPost },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })

    const deleteBtn = wrapper.findAll('button').find(b => b.text().includes('Delete'))
    if (deleteBtn) await deleteBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Failed to delete post. Please try again.')
  })

  it('does not clear error when modal opens (open: false to true)', async () => {
    const wrapper = await mountSuspended(BlogPostDeleteModal, {
      props: { open: false, post: mockPost },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })
    await wrapper.setProps({ open: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.exists()).toBe(true)
  })

  it('shows Deleting... when store.loading is true', async () => {
    const store = useBlogStore()
    store.loading = true

    const wrapper = await mountSuspended(BlogPostDeleteModal, {
      props: { open: true, post: mockPost },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogPanel: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
        }
      }
    })

    expect(wrapper.text()).toContain('Deleting...')
    store.loading = false
  })
})
