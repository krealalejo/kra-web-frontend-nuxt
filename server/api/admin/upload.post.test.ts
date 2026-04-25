import { describe, it, expect, vi, beforeEach } from 'vitest'

// Stub Nuxt/H3 server-side auto-imports
vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn())
vi.stubGlobal('createError', (err: any) => err)
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('$fetch', vi.fn())

describe('upload.post', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useRuntimeConfig', () => ({ 
      public: { apiBase: 'https://api.example.com' } 
    }))
  })

  it('throws 401 if no token', async () => {
    vi.stubGlobal('getCookie', () => undefined)
    const mod = await import('./upload.post')
    const handler = mod.default as Function
    
    try {
      await handler({})
    } catch (e: any) {
      expect(e.statusCode).toBe(401)
    }
  })

  it('proxies request to backend API with token', async () => {
    vi.stubGlobal('getCookie', () => 'fake-token')
    const body = { filename: 'test.png', contentType: 'image/png' }
    vi.stubGlobal('readBody', () => body)
    
    const mockResponse = { uploadUrl: 'https://s3.presigned', s3Key: 'images/test' }
    const fetchMock = vi.fn().mockResolvedValue(mockResponse)
    vi.stubGlobal('$fetch', fetchMock)

    const mod = await import('./upload.post')
    const handler = mod.default as Function
    const result = await handler({})

    expect(result).toEqual(mockResponse)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/admin/upload'), {
      method: 'POST',
      headers: { Authorization: 'Bearer fake-token' },
      body,
    })
  })
})
