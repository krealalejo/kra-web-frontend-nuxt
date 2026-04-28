import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())
vi.stubGlobal('getRouterParam', vi.fn())
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({
  apiBase: 'http://localhost:3001',
}))
vi.stubGlobal('$fetch', vi.fn())
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as any
  err.statusCode = opts.statusCode
  return err
})

describe('admin/projects/[owner]/[repo].put', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({
      apiBase: 'http://localhost:3001',
    }))
  })

  it('throws 401 when session cookie is absent', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue(undefined))
    vi.stubGlobal('getRouterParam', vi.fn().mockImplementation((_event, param) => param === 'owner' ? 'kevin' : 'my-repo'))

    const mod = await import('./[repo].put')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 400 when owner param is missing', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('some-token'))
    vi.stubGlobal('getRouterParam', vi.fn().mockImplementation((_event, param) => param === 'owner' ? undefined : 'my-repo'))

    const mod = await import('./[repo].put')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toMatchObject({ statusCode: 400, statusMessage: 'Missing owner parameter' })
  })

  it('throws 400 when repo param is missing', async () => {
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('some-token'))
    vi.stubGlobal('getRouterParam', vi.fn().mockImplementation((_event, param) => param === 'owner' ? 'kevin' : undefined))

    const mod = await import('./[repo].put')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toMatchObject({ statusCode: 400, statusMessage: 'Missing repo parameter' })
  })

  it('calls PUT on the upstream API with allowlisted fields', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ success: true })
    vi.stubGlobal('getCookie', vi.fn().mockReturnValue('my-token'))
    vi.stubGlobal('getRouterParam', vi.fn().mockImplementation((_event, param) => param === 'owner' ? 'kevin' : 'my-repo'))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({
      role: 'Lead',
      year: 2024,
      kind: 'personal',
      mainBranch: 'main',
      stack: ['Nuxt'],
      extra: 'should be ignored'
    }))
    vi.stubGlobal('$fetch', mockFetch)

    const mod = await import('./[repo].put')
    const handler = mod.default as Function
    const result = await handler({})

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/metadata/kevin/my-repo'),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
        body: {
          role: 'Lead',
          year: 2024,
          kind: 'personal',
          mainBranch: 'main',
          stack: ['Nuxt']
        }
      })
    )
    expect(result).toEqual({ success: true })
  })
})
