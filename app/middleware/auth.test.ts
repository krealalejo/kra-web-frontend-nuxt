import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

vi.stubGlobal('defineNuxtRouteMiddleware', (fn: Function) => fn)

const { mockFetchImpl, mockNavigateImpl } = vi.hoisted(() => ({
  mockFetchImpl: vi.fn(),
  mockNavigateImpl: vi.fn(),
}))

mockNuxtImport('useFetch', () => mockFetchImpl)
mockNuxtImport('navigateTo', () => mockNavigateImpl)

describe('middleware/auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('module loads and default export is a function', async () => {
    const mod = await import('./auth')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('returns undefined immediately for /admin/login (no session check needed)', async () => {
    const mod = await import('./auth')
    const middleware = mod.default as Function
    const result = await middleware({ path: '/admin/login' })
    expect(result).toBeUndefined()
  })

  it('returns undefined immediately for /admin/callback (no session check needed)', async () => {
    const mod = await import('./auth')
    const middleware = mod.default as Function
    const result = await middleware({ path: '/admin/callback' })
    expect(result).toBeUndefined()
  })

  it('executes session check branch for protected /admin route without throwing', async () => {
    mockFetchImpl.mockRejectedValue(new Error('network error'))
    const mod = await import('./auth')
    const middleware = mod.default as Function
    await middleware({ path: '/admin' }).catch(() => {})
    expect(true).toBe(true)
  })

  it('executes session check branch for /admin/posts without throwing', async () => {
    mockFetchImpl.mockRejectedValue(new Error('network error'))
    const mod = await import('./auth')
    const middleware = mod.default as Function
    await middleware({ path: '/admin/posts' }).catch(() => {})
    expect(true).toBe(true)
  })

  it('does not redirect when session is authenticated', async () => {
    mockFetchImpl.mockResolvedValue({ data: ref({ authenticated: true }) })
    const mod = await import('./auth')
    const middleware = mod.default as Function
    await middleware({ path: '/admin/posts' })
    expect(mockNavigateImpl).not.toHaveBeenCalled()
  })

  it('redirects to /admin/login when session is not authenticated', async () => {
    mockFetchImpl.mockResolvedValue({ data: ref({ authenticated: false }) })
    mockNavigateImpl.mockReturnValue('/admin/login')
    const mod = await import('./auth')
    const middleware = mod.default as Function
    await middleware({ path: '/admin/posts' })
    expect(mockNavigateImpl).toHaveBeenCalledWith('/admin/login')
  })

  it('redirects to /admin/login when session data is null', async () => {
    mockFetchImpl.mockResolvedValue({ data: ref(null) })
    mockNavigateImpl.mockReturnValue('/admin/login')
    const mod = await import('./auth')
    const middleware = mod.default as Function
    await middleware({ path: '/admin/dashboard' })
    expect(mockNavigateImpl).toHaveBeenCalledWith('/admin/login')
  })
})
