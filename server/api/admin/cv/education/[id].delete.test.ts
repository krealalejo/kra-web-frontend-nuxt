import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('getRouterParam', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ apiBase: 'http://localhost:3001', public: { apiBase: 'http://localhost:3001' } }))
vi.stubGlobal('$fetch', vi.fn())
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as any
  err.statusCode = opts.statusCode
  return err
})

describe('server/api/admin/cv/education/[id].delete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ apiBase: 'http://localhost:3001', public: { apiBase: 'http://localhost:3001' } }))
  })

  it('throws 401 when session cookie is absent', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue(undefined))
    vi.stubGlobal('getRouterParam', vi.fn().mockReturnValue('edu-1'))
    const mod = await import('./[id].delete')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 400 when id parameter is missing', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('getRouterParam', vi.fn().mockReturnValue(undefined))
    const mod = await import('./[id].delete')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 400 })
  })

  it('calls DELETE on the upstream API and returns success', async () => {
    const mockFetch = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('getRouterParam', vi.fn().mockReturnValue('edu-1'))
    vi.stubGlobal('$fetch', mockFetch)
    const mod = await import('./[id].delete')
    const handler = mod.default as Function
    const result = await handler({})
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/cv/education/edu-1'),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }),
    )
    expect(result).toEqual({ success: true })
  })
})
