import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('getRouterParam', vi.fn((_event, param) => param === 'type' ? 'SHIPPING' : ''))
vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ apiBase: 'http://localhost:3001', public: { apiBase: 'http://localhost:3001' } }))
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

// Additional coverage tests
describe('server/api/admin/activity/[type].put — additional', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ title: 'T' }))
    vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ apiBase: 'http://localhost:3001' }))
  })

  it('throws 400 when type is invalid', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('token'))
    vi.stubGlobal('getRouterParam', vi.fn().mockReturnValue('INVALID'))
    const mod = await import('./[type].put')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 400 })
  })

  it('forwards only title description tags from body', async () => {
    const mockF = vi.fn().mockResolvedValue({})
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('token'))
    vi.stubGlobal('getRouterParam', vi.fn().mockReturnValue('READING'))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ title: 'T', description: 'D', tags: ['x'], extra: 'ignored' }))
    vi.stubGlobal('$fetch', mockF)
    const mod = await import('./[type].put')
    const handler = mod.default as Function
    await handler({})
    const body = mockF.mock.calls[0][1].body
    expect(body).toHaveProperty('title', 'T')
    expect(body).not.toHaveProperty('extra')
  })

  it('accepts PLAYING type (case-insensitive)', async () => {
    const mockF = vi.fn().mockResolvedValue({})
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('token'))
    vi.stubGlobal('getRouterParam', vi.fn().mockReturnValue('playing'))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ tags: ['game'] }))
    vi.stubGlobal('$fetch', mockF)
    const mod = await import('./[type].put')
    const handler = mod.default as Function
    await handler({})
    expect(mockF).toHaveBeenCalledWith(expect.stringContaining('/activity/PLAYING'), expect.any(Object))
  })
})
