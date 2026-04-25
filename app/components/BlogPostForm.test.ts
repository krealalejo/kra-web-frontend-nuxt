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
})
