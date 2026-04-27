import { describe, it, expect, vi } from 'vitest'

// Stub Nuxt/H3 server-side auto-imports before module load
vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({
  apiBase: 'http://localhost:3001', public: { apiBase: 'http://localhost:3001' },
}))
vi.stubGlobal('$fetch', vi.fn())

describe('admin/posts/index.get', () => {
  it('exists as a module', async () => {
    const mod = await import('./index.get')
    expect(mod.default).toBeDefined()
  })

  it('default export is a function', async () => {
    const mod = await import('./index.get')
    expect(typeof mod.default).toBe('function')
  })

  it('calls upstream API with auth header when session cookie present', async () => {
    const mockFetch = vi.fn().mockResolvedValue([])
    const mockGetCookie = vi.fn().mockReturnValue('test-token')

    vi.stubGlobal('$fetch', mockFetch)
    vi.stubGlobal('getCookie', mockGetCookie)

    const mod = await import('./index.get')
    const handler = mod.default as Function
    await handler({})

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/posts'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    )
  })

  it('calls upstream API without auth header when no cookie', async () => {
    const mockFetch = vi.fn().mockResolvedValue([])
    const mockGetCookie = vi.fn().mockReturnValue(undefined)

    vi.stubGlobal('$fetch', mockFetch)
    vi.stubGlobal('getCookie', mockGetCookie)

    const mod = await import('./index.get')
    const handler = mod.default as Function
    await handler({})

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/posts'),
      expect.objectContaining({ headers: {} }),
    )
  })
})
