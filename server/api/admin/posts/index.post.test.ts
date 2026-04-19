import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({
  public: { apiBase: 'http://localhost:3001' },
}))
vi.stubGlobal('$fetch', vi.fn())
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as any
  err.statusCode = opts.statusCode
  return err
})

describe('admin/posts/index.post', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({
      public: { apiBase: 'http://localhost:3001' },
    }))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ slug: 'new-post', title: 'New', content: '' }))
  })

  it('throws 401 when session cookie is absent', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue(undefined))

    const mod = await import('./index.post')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toMatchObject({ statusCode: 401 })
  })

  it('calls POST on the upstream API with auth header and returns the response', async () => {
    const newPost = { slug: 'new-post', title: 'New', content: '' }
    const mockFetch = vi.fn().mockResolvedValue(newPost)
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('$fetch', mockFetch)

    const mod = await import('./index.post')
    const handler = mod.default as Function
    const result = await handler({})

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/posts'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }),
    )
    expect(result).toEqual(newPost)
  })
})
