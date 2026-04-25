import { describe, it, expect, vi, beforeEach } from 'vitest'

// Stub Nuxt/H3 server-side auto-imports
vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('getQuery', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn())
vi.stubGlobal('createError', (err: any) => err)
vi.stubGlobal('$fetch', vi.fn())

describe('image-status.get', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useRuntimeConfig', () => ({ s3BucketUrl: 'https://s3.example.com' }))
  })

  it('throws 401 if no token', async () => {
    vi.stubGlobal('getCookie', () => undefined)
    const mod = await import('./image-status.get')
    const handler = mod.default as Function
    
    try {
      await handler({})
    } catch (e: any) {
      expect(e.statusCode).toBe(401)
    }
  })

  it('throws 400 if no key query param', async () => {
    vi.stubGlobal('getCookie', () => 'fake-token')
    vi.stubGlobal('getQuery', () => ({}))
    const mod = await import('./image-status.get')
    const handler = mod.default as Function

    try {
      await handler({})
    } catch (e: any) {
      expect(e.statusCode).toBe(400)
      expect(e.statusMessage).toBe('Missing key parameter')
    }
  })

  it('returns ready: true if HEAD request succeeds', async () => {
    vi.stubGlobal('getCookie', () => 'fake-token')
    vi.stubGlobal('getQuery', () => ({ key: 'images/test.jpg' }))
    // Match actual behavior where s3BucketUrl might be empty in test env if not properly mocked
    vi.stubGlobal('useRuntimeConfig', () => ({ s3BucketUrl: 'https://s3.example.com' }))
    
    const fetchMock = vi.fn().mockResolvedValue({})
    vi.stubGlobal('$fetch', fetchMock)

    const mod = await import('./image-status.get')
    const handler = mod.default as Function
    const result = await handler({})

    expect(result).toEqual({ ready: true })
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('thumbnails/test-thumb.webp'), { method: 'HEAD' })
  })

  it('returns ready: false if HEAD request fails', async () => {
    vi.stubGlobal('getCookie', () => 'fake-token')
    vi.stubGlobal('getQuery', () => ({ key: 'images/test.jpg' }))
    const fetchMock = vi.fn().mockRejectedValue(new Error('404'))
    vi.stubGlobal('$fetch', fetchMock)

    const mod = await import('./image-status.get')
    const handler = mod.default as Function
    const result = await handler({})

    expect(result).toEqual({ ready: false })
  })
})
