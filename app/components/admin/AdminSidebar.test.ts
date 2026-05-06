import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import AdminSidebar from './AdminSidebar.vue'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn()
}))

mockNuxtImport('navigateTo', () => mockNavigate)

vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({}))

describe('components/admin/AdminSidebar.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all navigation links', async () => {
    const wrapper = await mountSuspended(AdminSidebar)
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(6)
    expect(wrapper.text()).toContain('Profile')
    expect(wrapper.text()).toContain('Activity')
    expect(wrapper.text()).toContain('CV Manager')
    expect(wrapper.text()).toContain('Projects')
    expect(wrapper.text()).toContain('Blog Posts')
    expect(wrapper.text()).toContain('Code Quality')
  })

  it('renders correctly', async () => {
    const wrapper = await mountSuspended(AdminSidebar)
    expect(wrapper.find('aside').exists()).toBe(true)
  })

  it('shows the user email from cookie', async () => {
    const wrapper = await mountSuspended(AdminSidebar)
    expect(wrapper.text()).toContain('Admin')
  })

  it('calls logout and navigates to login', async () => {
    const mockFetch = vi.fn().mockResolvedValue({})
    vi.stubGlobal('$fetch', mockFetch)

    const wrapper = await mountSuspended(AdminSidebar)
    const logoutBtn = wrapper.find('button')
    await logoutBtn.trigger('click')

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
      expect(mockNavigate).toHaveBeenCalledWith('/admin/login')
    })
  })

  it('isLinkActive returns true for /admin when route is exactly /admin', async () => {
    const wrapper = await mountSuspended(AdminSidebar, { route: '/admin' })
    const blogLink = wrapper.findAll('a').find(a => a.text().includes('Blog Posts'))
    expect(blogLink?.attributes('style')).toContain('var(--overlay)')
  })

  it('isLinkActive returns false for /admin when route is /admin/posts', async () => {
    const wrapper = await mountSuspended(AdminSidebar, { route: '/admin/posts' })
    const blogLink = wrapper.findAll('a').find(a => a.text().includes('Blog Posts'))
    expect(blogLink?.attributes('style')).not.toContain('var(--overlay)')
  })

  it('isLinkActive returns true for /admin/profile when route starts with it', async () => {
    const wrapper = await mountSuspended(AdminSidebar, { route: '/admin/profile' })
    const profileLink = wrapper.findAll('a').find(a => a.text().includes('Profile'))
    expect(profileLink?.attributes('style')).toContain('var(--overlay)')
  })

  it('isLinkActive returns false for /admin/profile when route is /admin/activity', async () => {
    const wrapper = await mountSuspended(AdminSidebar, { route: '/admin/activity' })
    const profileLink = wrapper.findAll('a').find(a => a.text().includes('Profile'))
    expect(profileLink?.attributes('style')).not.toContain('var(--overlay)')
  })
})
