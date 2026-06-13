import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  apiBase: 'http://localhost:8080',
  public: { apiBase: 'http://localhost:8080' },
})))
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('getQuery', vi.fn())
vi.stubGlobal('createError', vi.fn((err) => err))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('api/admin/s3.delete', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('./s3.delete')
    handler = mod.default
  })

  it('throws 401 if no token', async () => {
    vi.mocked(getCookie).mockReturnValue(undefined)
    try {
      await handler({} as any)
      expect.unreachable()
    } catch (e: any) {
      expect(e.statusCode).toBe(401)
    }
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('throws 400 if key parameter is missing', async () => {
    vi.mocked(getCookie).mockReturnValue('tok')
    vi.mocked(getQuery).mockReturnValue({})
    try {
      await handler({} as any)
      expect.unreachable()
    } catch (e: any) {
      expect(e.statusCode).toBe(400)
    }
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('proxies DELETE with auth token and encoded key, returns null', async () => {
    vi.mocked(getCookie).mockReturnValue('tok456')
    vi.mocked(getQuery).mockReturnValue({ key: 'images/foo bar.jpg' })
    mockFetch.mockResolvedValue(undefined)

    const result = await handler({} as any)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/admin/s3?key=images%2Ffoo%20bar.jpg',
      expect.objectContaining({
        method: 'DELETE',
        headers: { Authorization: 'Bearer tok456' },
      })
    )
    expect(result).toBeNull()
  })
})
