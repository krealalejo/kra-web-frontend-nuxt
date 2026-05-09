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

describe('api/admin/metrics.get', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('./metrics.get')
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

  it('proxies metrics request with auth token', async () => {
    vi.mocked(getCookie).mockReturnValue('tok456')
    const fakeMetrics = { thumb_invocations: { values: [3], timestamps: [] } }
    mockFetch.mockResolvedValue(fakeMetrics)

    const result = await handler({} as any)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/admin/metrics',
      expect.objectContaining({
        headers: { Authorization: 'Bearer tok456' },
      })
    )
    expect(result).toEqual(fakeMetrics)
  })
})
