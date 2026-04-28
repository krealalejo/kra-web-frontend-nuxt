import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { h } from 'vue'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

vi.mock('~/middleware/auth', () => ({ default: vi.fn() }))

vi.mock('~/components/BlogPostForm.vue', () => ({
  default: { name: 'BlogPostForm', props: ['open', 'post'], emits: ['close', 'saved'], render: () => null },
}))
vi.mock('~/components/BlogPostDeleteModal.vue', () => ({
  default: { name: 'BlogPostDeleteModal', props: ['open', 'post'], emits: ['close', 'deleted'], render: () => null },
}))
vi.mock('~/components/BlogPostTable.vue', () => ({
  default: {
    name: 'BlogPostTable',
    props: ['posts'],
    emits: ['edit', 'delete'],
    render: () => h('table', [h('tbody', [h('tr', [h('td', 'Post Title')])])])
  },
}))

import AdminIndexPage from './index.vue'

const mockPost = {
  slug: 'test-post',
  title: 'Test Post',
  content: 'Content',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('pages/admin/index.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
  })

  it('renders the page heading', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(AdminIndexPage)
    expect(wrapper.find('h1').text()).toBe('Blog Posts')
  })

  it('renders the Create Post button', async () => {
    mockFetch.mockResolvedValue([])
    const wrapper = await mountSuspended(AdminIndexPage)
    const btns = wrapper.findAll('button').filter(b => b.text().includes('Create Post'))
    expect(btns.length).toBeGreaterThan(0)
  })

  it('shows empty state when no posts exist', async () => {
    mockFetch.mockResolvedValue([])
    const wrapper = await mountSuspended(AdminIndexPage)
    await new Promise(r => setTimeout(r, 50))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No blog posts yet')
  })

  it('renders posts table when posts exist', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(AdminIndexPage)
    await new Promise(r => setTimeout(r, 50))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('opens create modal when Create Post button is clicked', async () => {
    mockFetch.mockResolvedValue([])
    const wrapper = await mountSuspended(AdminIndexPage)
    const createBtn = wrapper.findAll('button').find(b => b.text().includes('Create Post'))
    if (createBtn) {
      await createBtn.trigger('click')
      const form = wrapper.findComponent({ name: 'BlogPostForm' })
      expect(form.props('open')).toBe(true)
      expect(form.props('post')).toBeNull()
    }
  })

  it('sets editingPost when edit is emitted from table', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(AdminIndexPage)
    await new Promise(r => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    const table = wrapper.findComponent({ name: 'BlogPostTable' })
    await table.vm.$emit('edit', mockPost)

    const form = wrapper.findComponent({ name: 'BlogPostForm' })
    expect(form.props('open')).toBe(true)
    expect(form.props('post')).toEqual(mockPost)
  })

  it('sets deletingPost when delete is emitted from table', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(AdminIndexPage)
    await new Promise(r => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    const table = wrapper.findComponent({ name: 'BlogPostTable' })
    await table.vm.$emit('delete', mockPost)

    const deleteModal = wrapper.findComponent({ name: 'BlogPostDeleteModal' })
    expect(deleteModal.props('open')).toBe(true)
    expect(deleteModal.props('post')).toEqual(mockPost)
  })

  it('closeFormModal resets form state', async () => {
    mockFetch.mockResolvedValue([])
    const wrapper = await mountSuspended(AdminIndexPage)

    const form = wrapper.findComponent({ name: 'BlogPostForm' })
    const createBtn = wrapper.findAll('button').find(b => b.text().includes('Create Post'))
    if (createBtn) await createBtn.trigger('click')
    expect(form.props('open')).toBe(true)

    await form.vm.$emit('close')
    expect(form.props('open')).toBe(false)
    expect(form.props('post')).toBeNull()
  })

  it('closeDeleteModal resets delete state', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(AdminIndexPage)
    await new Promise(r => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    const table = wrapper.findComponent({ name: 'BlogPostTable' })
    await table.vm.$emit('delete', mockPost)

    const deleteModal = wrapper.findComponent({ name: 'BlogPostDeleteModal' })
    expect(deleteModal.props('open')).toBe(true)

    await deleteModal.vm.$emit('close')
    expect(deleteModal.props('open')).toBe(false)
    expect(deleteModal.props('post')).toBeNull()
  })
})
