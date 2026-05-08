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

  it('includes cvPortraitUrl in safe body when provided', async () => {
    vi.mocked(getCookie).mockReturnValue('valid-token')
    vi.mocked(readBody).mockResolvedValue({ cvPortraitUrl: 'images/portrait-cv.jpg' })
    mockFetch.mockResolvedValue({})
    await handler({} as any)
    const body = mockFetch.mock.calls[0][1].body
    expect(body).toHaveProperty('cvPortraitUrl', 'images/portrait-cv.jpg')
    expect(body).not.toHaveProperty('homePortraitUrl')
  })

  it('includes cvPdfUrl in safe body when provided', async () => {
    vi.mocked(getCookie).mockReturnValue('valid-token')
    vi.mocked(readBody).mockResolvedValue({ cvPdfUrl: 'docs/cv.pdf' })
    mockFetch.mockResolvedValue({})
    await handler({} as any)
    const body = mockFetch.mock.calls[0][1].body
    expect(body).toHaveProperty('cvPdfUrl', 'docs/cv.pdf')
    expect(body).not.toHaveProperty('homePortraitUrl')
    expect(body).not.toHaveProperty('cvPortraitUrl')
  })

  it('sends empty safe body when no url fields are provided', async () => {
    vi.mocked(getCookie).mockReturnValue('valid-token')
    vi.mocked(readBody).mockResolvedValue({ unrelated: 'field' })
    mockFetch.mockResolvedValue({})
    await handler({} as any)
    const body = mockFetch.mock.calls[0][1].body
    expect(body).not.toHaveProperty('homePortraitUrl')
    expect(body).not.toHaveProperty('cvPortraitUrl')
    expect(body).not.toHaveProperty('cvPdfUrl')
  })
})
