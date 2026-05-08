import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ apiBase: 'http://localhost:3001', public: { apiBase: 'http://localhost:3001' } }))
vi.stubGlobal('$fetch', vi.fn())
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as any
  err.statusCode = opts.statusCode
  return err
})

describe('server/api/admin/cv/skills/categories.post', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ apiBase: 'http://localhost:3001', public: { apiBase: 'http://localhost:3001' } }))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({
      name: 'Backend', skills: ['Java', 'Spring Boot'], sortOrder: 1,
    }))
  })

  it('throws 401 when session cookie is absent', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue(undefined))
    const mod = await import('./categories.post')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 401 })
  })

  it('calls POST on the upstream API with auth header and returns the response', async () => {
    const newCategory = { id: 'cat-1', name: 'Backend', skills: ['Java', 'Spring Boot'], sortOrder: 1 }
    const mockFetch = vi.fn().mockResolvedValue(newCategory)
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('$fetch', mockFetch)
    const mod = await import('./categories.post')
    const handler = mod.default as Function
    const result = await handler({})
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/cv/skills/categories'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }),
    )
    expect(result).toEqual(newCategory)
  })

  it('throws 422 when name is missing', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ skills: ['Java'] }))
    const mod = await import('./categories.post')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 422 when sortOrder is a float', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ name: 'Test', sortOrder: 1.5 }))
    const mod = await import('./categories.post')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 422 when sortOrder is zero', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ name: 'Test', sortOrder: 0 }))
    const mod = await import('./categories.post')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 422 when sortOrder is a non-number string', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ name: 'Test', sortOrder: 'first' }))
    const mod = await import('./categories.post')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 422 when skills is not an array', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ name: 'Test', skills: 'Java' }))
    const mod = await import('./categories.post')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 422 when skills array contains non-string elements', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ name: 'Test', skills: [1, 2] }))
    const mod = await import('./categories.post')
    const handler = mod.default as Function
    await expect(handler({})).rejects.toMatchObject({ statusCode: 422 })
  })

  it('omits sortOrder from body when not provided', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ name: 'Test', skills: ['Java'] }))
    const mockFetch2 = vi.fn().mockResolvedValue({})
    vi.stubGlobal('$fetch', mockFetch2)
    const mod = await import('./categories.post')
    const handler = mod.default as Function
    await handler({})
    expect(mockFetch2.mock.calls[0][1].body).not.toHaveProperty('sortOrder')
  })

  it('omits skills from body when not provided', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ name: 'Test' }))
    const mockFetch3 = vi.fn().mockResolvedValue({})
    vi.stubGlobal('$fetch', mockFetch3)
    const mod = await import('./categories.post')
    const handler = mod.default as Function
    await handler({})
    const body = mockFetch3.mock.calls[0][1].body
    expect(body).toHaveProperty('name', 'Test')
    expect(body).not.toHaveProperty('skills')
    expect(body).not.toHaveProperty('sortOrder')
  })
})
