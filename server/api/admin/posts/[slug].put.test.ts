import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('getRouterParam', vi.fn())
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

describe('admin/posts/[slug].put', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({
      public: { apiBase: 'http://localhost:3001' },
    }))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ title: 'Updated', content: 'New content' }))
  })

  it('throws 401 when session cookie is absent', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue(undefined))
    vi.stubGlobal('getRouterParam', vi.fn().mockReturnValue('my-post'))

    const mod = await import('./[slug].put')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 400 when slug param is missing', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('some-token'))
    vi.stubGlobal('getRouterParam', vi.fn().mockReturnValue(undefined))

    const mod = await import('./[slug].put')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toMatchObject({ statusCode: 400 })
  })

  it('calls PUT on the upstream API and returns the response', async () => {
    const updatedPost = { slug: 'hello-world', title: 'Updated', content: 'New content' }
    const mockFetch = vi.fn().mockResolvedValue(updatedPost)
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('getRouterParam', vi.fn().mockReturnValue('hello-world'))
    vi.stubGlobal('$fetch', mockFetch)

    const mod = await import('./[slug].put')
    const handler = mod.default as Function
    const result = await handler({})

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/posts/hello-world'),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }),
    )
    expect(result).toEqual(updatedPost)
  })
})
