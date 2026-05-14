import { describe, it, expect, vi } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)
vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ apiBase: 'http://localhost:8080/' }))

const { default: handler } = await import('./posts')

describe('_sitemap/posts', () => {
  it('returns sitemap URL entries and strips trailing slash from apiBase', async () => {
    mockFetch.mockResolvedValueOnce([
      { slug: 'hello-world', updatedAt: '2024-01-15T10:00:00Z' },
      { slug: 'second-post', updatedAt: '2024-03-01T08:00:00Z' },
    ])

    const result = await (handler as Function)({})

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/posts')
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ loc: '/blog/hello-world', lastmod: '2024-01-15T10:00:00Z', priority: 0.8 })
    expect(result[1]).toMatchObject({ loc: '/blog/second-post', lastmod: '2024-03-01T08:00:00Z' })
  })

  it('returns empty array when API throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network error'))

    const result = await (handler as Function)({})

    expect(result).toEqual([])
  })

  it('returns empty array when API returns empty list', async () => {
    mockFetch.mockResolvedValueOnce([])

    const result = await (handler as Function)({})

    expect(result).toEqual([])
  })
})
