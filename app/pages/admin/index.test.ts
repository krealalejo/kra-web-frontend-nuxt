import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'

const { mockFetchImpl, mockNavigateImpl } = vi.hoisted(() => ({
  mockFetchImpl: vi.fn(),
  mockNavigateImpl: vi.fn(),
}))

mockNuxtImport('useFetch', () => mockFetchImpl)
mockNuxtImport('navigateTo', () => mockNavigateImpl)

import AdminIndexPage from './index.vue'

describe('pages/admin/index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /admin/quality when authenticated', async () => {
    mockFetchImpl.mockResolvedValue({ data: ref({ authenticated: true }) })
    await mountSuspended(AdminIndexPage)
    expect(mockNavigateImpl).toHaveBeenCalledWith('/admin/quality', { replace: true })
  })

  it('redirects to /admin/login when not authenticated', async () => {
    mockFetchImpl.mockResolvedValue({ data: ref({ authenticated: false }) })
    await mountSuspended(AdminIndexPage)
    expect(mockNavigateImpl).toHaveBeenCalledWith('/admin/login', { replace: true })
  })

  it('redirects to /admin/login when session data is null', async () => {
    mockFetchImpl.mockResolvedValue({ data: ref(null) })
    await mountSuspended(AdminIndexPage)
    expect(mockNavigateImpl).toHaveBeenCalledWith('/admin/login', { replace: true })
  })
})
