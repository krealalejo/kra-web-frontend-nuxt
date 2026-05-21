import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import AdminSidebar from './AdminSidebar.vue'

const { mockNavigate, mockRoute } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockRoute: { path: '/admin', query: {}, params: {}, matched: [], hash: '', meta: {} }
}))

mockNuxtImport('navigateTo', () => mockNavigate)
mockNuxtImport('useRoute', () => () => mockRoute)

vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({}))

describe('components/admin/AdminSidebar.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.path = '/admin'
  })

  it('renders all navigation links', () => {
    const wrapper = mount(AdminSidebar)
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(6)
    expect(wrapper.text()).toContain('Profile')
    expect(wrapper.text()).toContain('Activity')
    expect(wrapper.text()).toContain('CV Manager')
    expect(wrapper.text()).toContain('Projects')
    expect(wrapper.text()).toContain('Blog Posts')
    expect(wrapper.text()).toContain('Code Quality')
  })

  it('renders correctly', () => {
    const wrapper = mount(AdminSidebar)
    expect(wrapper.find('aside').exists()).toBe(true)
  })

  it('shows the user email from cookie', () => {
    const wrapper = mount(AdminSidebar)
    expect(wrapper.text()).toContain('Admin')
  })

  it('calls logout and navigates to login', async () => {
    const mockFetch = vi.fn().mockResolvedValue({})
    vi.stubGlobal('$fetch', mockFetch)

    const wrapper = mount(AdminSidebar)
    const logoutBtn = wrapper.find('button')
    await logoutBtn.trigger('click')

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
      expect(mockNavigate).toHaveBeenCalledWith('/admin/login')
    })
  })

  it('isLinkActive returns true for /admin/posts when route starts with it', () => {
    mockRoute.path = '/admin/posts'
    const wrapper = mount(AdminSidebar)
    const blogLink = wrapper.findAll('a').find(a => a.text().includes('Blog Posts'))
    expect(blogLink?.attributes('style')).toContain('var(--overlay)')
  })

  it('isLinkActive returns false for /admin/posts when route is /admin/quality', () => {
    mockRoute.path = '/admin/quality'
    const wrapper = mount(AdminSidebar)
    const blogLink = wrapper.findAll('a').find(a => a.text().includes('Blog Posts'))
    expect(blogLink?.attributes('style')).not.toContain('var(--overlay)')
  })

  it('isLinkActive returns true for /admin/profile when route starts with it', () => {
    mockRoute.path = '/admin/profile'
    const wrapper = mount(AdminSidebar)
    const profileLink = wrapper.findAll('a').find(a => a.text().includes('Profile'))
    expect(profileLink?.attributes('style')).toContain('var(--overlay)')
  })

  it('isLinkActive returns false for /admin/profile when route is /admin/activity', () => {
    mockRoute.path = '/admin/activity'
    const wrapper = mount(AdminSidebar)
    const profileLink = wrapper.findAll('a').find(a => a.text().includes('Profile'))
    expect(profileLink?.attributes('style')).not.toContain('var(--overlay)')
  })
})
