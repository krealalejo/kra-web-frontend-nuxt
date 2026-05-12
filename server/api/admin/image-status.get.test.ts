import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  apiBase: 'http://localhost:8080', public: { apiBase: 'http://localhost:8080' }
})))
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('getQuery', vi.fn())
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('createError', vi.fn((err) => err))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('api/admin/image-status.get', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('./image-status.get')
    handler = mod.default
  })

  it('throws 401 if no token is present', async () => {
    vi.mocked(getCookie).mockReturnValue(undefined)

    try {
      await handler({} as any)
    } catch (e: any) {
      expect(e.statusCode).toBe(401)
    }
  })

  it('throws 400 if key is missing', async () => {
    vi.mocked(getCookie).mockReturnValue('valid-token')
    vi.mocked(getQuery).mockReturnValue({})

    try {
      await handler({} as any)
    } catch (e: any) {
      expect(e.statusCode).toBe(400)
    }
  })

  it('returns ready: true if final key exists', async () => {
    vi.mocked(getCookie).mockReturnValue('valid-token')
    vi.mocked(getQuery).mockReturnValue({ key: 'blog/my-post-cover.webp' })
    mockFetch.mockResolvedValue({})

    const result = await handler({} as any)

    expect(result).toEqual({ ready: true })
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/images/blog/my-post-cover.webp',
      { method: 'HEAD' }
    )
  })

  it('returns ready: true for portrait key', async () => {
    vi.mocked(getCookie).mockReturnValue('valid-token')
    vi.mocked(getQuery).mockReturnValue({ key: 'portraits/home.webp' })
    mockFetch.mockResolvedValue({})

    const result = await handler({} as any)

    expect(result).toEqual({ ready: true })
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/images/portraits/home.webp',
      { method: 'HEAD' }
    )
  })

  it('returns ready: false if key fetch fails', async () => {
    vi.mocked(getCookie).mockReturnValue('valid-token')
    vi.mocked(getQuery).mockReturnValue({ key: 'blog/my-post-cover.webp' })
    mockFetch.mockRejectedValue(new Error('Not found'))

    const result = await handler({} as any)

    expect(result).toEqual({ ready: false })
  })
})
