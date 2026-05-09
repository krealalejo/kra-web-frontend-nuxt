import { describe, it, expect, vi } from 'vitest'

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
      expect.stringContaining('/admin/posts'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    )
  })

  it('throws 401 when no session cookie', async () => {
    const mockFetch = vi.fn()
    const mockGetCookie = vi.fn().mockReturnValue(undefined)
    vi.stubGlobal('createError', vi.fn().mockImplementation((opts: object) => opts))
    vi.stubGlobal('$fetch', mockFetch)
    vi.stubGlobal('getCookie', mockGetCookie)

    const mod = await import('./index.get')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 401 })
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
