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
      expect((wrapper.vm as { showFormModal: boolean }).showFormModal).toBe(true)
      expect((wrapper.vm as { editingPost: null }).editingPost).toBeNull()
    }
  })

  it('sets editingPost when openEditModal is called', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(AdminIndexPage)
    const vm = wrapper.vm as {
      openEditModal: (post: typeof mockPost) => void
      editingPost: typeof mockPost | null
      showFormModal: boolean
    }
    vm.openEditModal(mockPost)
    expect(vm.editingPost).toEqual(mockPost)
    expect(vm.showFormModal).toBe(true)
  })

  it('sets deletingPost when openDeleteModal is called', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(AdminIndexPage)
    const vm = wrapper.vm as {
      openDeleteModal: (post: typeof mockPost) => void
      deletingPost: typeof mockPost | null
      showDeleteModal: boolean
    }
    vm.openDeleteModal(mockPost)
    expect(vm.deletingPost).toEqual(mockPost)
    expect(vm.showDeleteModal).toBe(true)
  })

  it('closeFormModal resets showFormModal and editingPost', async () => {
    mockFetch.mockResolvedValue([])
    const wrapper = await mountSuspended(AdminIndexPage)
    const vm = wrapper.vm as {
      openCreateModal: () => void
      closeFormModal: () => void
      showFormModal: boolean
      editingPost: null
    }
    vm.openCreateModal()
    expect(vm.showFormModal).toBe(true)
    vm.closeFormModal()
    expect(vm.showFormModal).toBe(false)
    expect(vm.editingPost).toBeNull()
  })

  it('closeDeleteModal resets showDeleteModal and deletingPost', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(AdminIndexPage)
    const vm = wrapper.vm as {
      openDeleteModal: (post: typeof mockPost) => void
      closeDeleteModal: () => void
      showDeleteModal: boolean
      deletingPost: null
    }
    vm.openDeleteModal(mockPost)
    expect(vm.showDeleteModal).toBe(true)
    vm.closeDeleteModal()
    expect(vm.showDeleteModal).toBe(false)
    expect(vm.deletingPost).toBeNull()
  })
})
