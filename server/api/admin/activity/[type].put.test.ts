import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('getRouterParam', vi.fn((_event, param) => param === 'type' ? 'SHIPPING' : ''))
vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ public: { apiBase: 'http://localhost:3001' } }))
vi.stubGlobal('$fetch', vi.fn())
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as any
  err.statusCode = opts.statusCode
  return err
})

describe('server/api/admin/activity/[type].put', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ title: 'New' }))
  })

  it('throws 401 when session cookie is absent', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue(undefined))
    const mod = await import('./[type].put')
    const handler = mod.default as Function
    await expect(handler({ context: { params: { type: 'SHIPPING' } } })).rejects.toMatchObject({ statusCode: 401 })
  })

  it('calls PUT on the upstream API with auth header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ type: 'SHIPPING', title: 'New' })
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('token'))
    vi.stubGlobal('$fetch', mockFetch)
    const mod = await import('./[type].put')
    const handler = mod.default as Function
    const result = await handler({ context: { params: { type: 'SHIPPING' } } })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/activity/SHIPPING'),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
        body: { title: 'New' }
      })
    )
    expect(result).toEqual({ type: 'SHIPPING', title: 'New' })
  })
})
