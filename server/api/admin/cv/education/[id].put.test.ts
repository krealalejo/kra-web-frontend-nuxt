import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('getRouterParam', vi.fn())
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ apiBase: 'http://localhost:3001', public: { apiBase: 'http://localhost:3001' } }))
vi.stubGlobal('$fetch', vi.fn())
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as any
  err.statusCode = opts.statusCode
  return err
})

describe('server/api/admin/cv/education/[id].put', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ apiBase: 'http://localhost:3001', public: { apiBase: 'http://localhost:3001' } }))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({
      title: 'MSc Software Engineering', institution: 'UPC', location: 'BCN', years: '2022-2024', description: 'Masters degree',
    }))
  })

  it('throws 401 when session cookie is absent', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue(undefined))
    vi.stubGlobal('getRouterParam', vi.fn().mockReturnValue('edu-1'))
    const mod = await import('./[id].put')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 400 when id parameter is missing', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('getRouterParam', vi.fn().mockReturnValue(undefined))
    const mod = await import('./[id].put')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 400 })
  })

  it('calls PUT on the upstream API with auth header and returns the response', async () => {
    const updated = { id: 'edu-1', title: 'MSc Software Engineering', institution: 'UPC', location: 'BCN', years: '2022-2024', description: 'Masters' }
    const mockFetch = vi.fn().mockResolvedValue(updated)
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('getRouterParam', vi.fn().mockReturnValue('edu-1'))
    vi.stubGlobal('$fetch', mockFetch)
    const mod = await import('./[id].put')
    const handler = mod.default as Function
    const result = await handler({})
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/cv/education/edu-1'),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }),
    )
    expect(result).toEqual(updated)
  })

  it('does NOT include sortOrder in forwarded body', async () => {
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({
      title: 'BSc', institution: 'UPC', location: 'BCN', years: '2020', description: 'Degree', sortOrder: 99,
    }))
    const mockFetch = vi.fn().mockResolvedValue({})
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('getRouterParam', vi.fn().mockReturnValue('edu-1'))
    vi.stubGlobal('$fetch', mockFetch)
    const mod = await import('./[id].put')
    const handler = mod.default as Function
    await handler({})
    const calledBody = mockFetch.mock.calls[0][1].body
    expect(calledBody).not.toHaveProperty('sortOrder')
  })
})
