import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ apiBase: 'http://localhost:3001', public: { apiBase: 'http://localhost:3001' } }))
vi.stubGlobal('$fetch', vi.fn())
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as any
  err.statusCode = opts.statusCode
  return err
})

describe('server/api/admin/cv/education.post', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ apiBase: 'http://localhost:3001', public: { apiBase: 'http://localhost:3001' } }))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({
      title: 'BSc Computer Science', institution: 'UPC', location: 'BCN', years: '2018-2022', description: 'Graduated', sortOrder: 1,
    }))
  })

  it('throws 401 when session cookie is absent', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue(undefined))
    const mod = await import('./education.post')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 401 })
  })

  it('calls POST on the upstream API with auth header and returns the response', async () => {
    const newEntry = { id: '1', title: 'BSc Computer Science', institution: 'UPC', location: 'BCN', years: '2018-2022', description: 'Graduated', sortOrder: 1 }
    const mockFetch = vi.fn().mockResolvedValue(newEntry)
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('$fetch', mockFetch)
    const mod = await import('./education.post')
    const handler = mod.default as Function
    const result = await handler({})
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/cv/education'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }),
    )
    expect(result).toEqual(newEntry)
  })
})
