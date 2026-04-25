import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BlogPostDeleteModal from './BlogPostDeleteModal.vue'
import { useBlogStore } from '~/stores/blog'

describe('components/BlogPostDeleteModal.vue', () => {
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
})
