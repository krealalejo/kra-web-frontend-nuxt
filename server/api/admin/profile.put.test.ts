import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  apiBase: 'http://localhost:8080', apiBase: 'http://localhost:8080', public: { apiBase: 'http://localhost:8080' }
})))
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('createError', vi.fn((err) => err))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('api/admin/profile.put', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('./profile.put')
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

  it('forwards body to kra-api /config/profile and returns response', async () => {
    vi.mocked(getCookie).mockReturnValue('valid-token')
    const mockBody = { homePortraitUrl: 'images/portrait-home.jpg' }
    vi.mocked(readBody).mockResolvedValue(mockBody)
    const mockResponse = { homePortraitUrl: 'images/portrait-home.jpg', cvPortraitUrl: null }
    mockFetch.mockResolvedValue(mockResponse)

    const result = await handler({} as any)

    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/config/profile',
      {
        method: 'PUT',
        headers: { Authorization: 'Bearer valid-token' },
        body: mockBody
      }
    )
  })
})
