import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ apiBase: 'http://localhost:3001', public: { apiBase: 'http://localhost:3001' } }))
vi.stubGlobal('$fetch', vi.fn())
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as any
  err.statusCode = opts.statusCode
  return err
})

describe('server/api/admin/cv/education.get', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws 401 when session cookie is absent', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue(undefined))
    const mod = await import('./education.get')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 401 })
  })

  it('calls GET on the upstream API and returns the response', async () => {
    const mockEducation = [{ id: '1', title: 'Uni' }]
    const mockFetch = vi.fn().mockResolvedValue(mockEducation)
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('token'))
    vi.stubGlobal('$fetch', mockFetch)
    const mod = await import('./education.get')
    const handler = mod.default as Function
    const result = await handler({})
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/cv/education'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      })
    )
    expect(result).toEqual(mockEducation)
  })
})
