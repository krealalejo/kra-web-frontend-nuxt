import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  apiBase: 'http://localhost:8080',
  public: { apiBase: 'http://localhost:8080' },
})))
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('createError', vi.fn((err) => err))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('api/admin/cache/flush.post', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('./flush.post')
    handler = mod.default
  })

  it('throws 401 if no token', async () => {
    vi.mocked(getCookie).mockReturnValue(undefined)
    try {
      await handler({} as any)
    } catch (e: any) {
      expect(e.statusCode).toBe(401)
    }
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('calls flush endpoint with auth token', async () => {
    vi.mocked(getCookie).mockReturnValue('tok123')
    mockFetch.mockResolvedValue({ flushed: true })

    const result = await handler({} as any)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/admin/cache/flush',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer tok123' },
      })
    )
    expect(result).toEqual({ flushed: true })
  })
})
