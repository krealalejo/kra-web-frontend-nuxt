import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

let mockApiBase = 'http://localhost:8080'

mockNuxtImport('useRuntimeConfig', () => {
  return () => ({
    public: { apiBase: mockApiBase },
    app: { baseURL: '/', buildAssetsDir: '/_nuxt/', cdnURL: '' }
  })
})

mockNuxtImport('useAsyncData', () => {
  return (_key: string, factory: () => Promise<any>, _options?: any) => {
    const data = ref(null)
    const pending = ref(true)
    const error = ref(null)
    const status = ref('idle')

    const promise = factory().then(res => {
      data.value = res
      pending.value = false
      status.value = 'success'
    }).catch(e => {
      error.value = e
      pending.value = false
      status.value = 'error'
    })

    return {
      data,
      pending,
      error,
      status,
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn()
    }
  }
})

vi.mock('~/composables/useGsapAnimations', () => ({
  useGsapCardStagger: vi.fn(),
}))

import BlogIndexPage from './index.vue'

const clearData = () => {
  try {
    const nuxtApp = window.useNuxtApp?.()
    if (nuxtApp) {
      nuxtApp.payload.data = {}
    }
  } catch (e) {}
}

const mockPost = {
  slug: 'hello-world',
  title: 'Hello World',
  content: '# Hello\nThis is a post.',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

function makeAsync(data: unknown, error: unknown = null) {
  return { data: ref(data), pending: ref(false), error: ref(error), refresh: vi.fn() }
}

describe('pages/blog/index.vue', () => {
  beforeEach(() => {
    mockApiBase = 'http://localhost:8080'
  })

  it('renders the Blog heading', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    expect(wrapper.find('h1').text()).toContain('Field notes')
  })

  it('renders post titles when posts are loaded', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    expect(wrapper.find('.blog-list').exists()).toBe(true)
    expect(wrapper.text()).toContain('Hello World')
  })

  it('shows empty state message when no posts exist', async () => {
    mockFetch.mockResolvedValue([])
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    expect(wrapper.text()).toContain('No posts yet')
  })

  it('formats post dates for display', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    const dateEl = wrapper.find('.date')
    expect(dateEl.exists()).toBe(true)
    expect(dateEl.text().length).toBeGreaterThan(0)
  })

  it('links to individual post pages', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    const links = wrapper.findAll('a').filter(a => a.attributes('href')?.includes('/blog/'))
    expect(links.length).toBeGreaterThan(0)
    expect(links[0]!.attributes('href')).toBe('/blog/hello-world')
  })

  it('shows an error state when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('API error'))
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    expect(wrapper.text()).toContain('API unavailable')
  })

  it('shows NUXT_PUBLIC_API_BASE_URL hint for MISSING_API_BASE errors', async () => {
    mockFetch.mockRejectedValue(new Error('MISSING_API_BASE'))
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    expect(wrapper.text()).toContain('NUXT_PUBLIC_API_BASE_URL')
  })

  it('shows error message for generic API errors', async () => {
    mockFetch.mockRejectedValue(new Error('Connection refused'))
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    expect(wrapper.text()).toContain('NUXT_PUBLIC_API_BASE_URL')
  })

  it('shows skeleton rows during pending state', async () => {
    let resolveFetch: any
    const fetchPromise = new Promise(resolve => { resolveFetch = resolve })
    mockFetch.mockReturnValue(fetchPromise)

    const wrapper = await mountSuspended(BlogIndexPage)

    const skeletons = wrapper.findAllComponents({ name: 'SkeletonBlogRow' })
    expect(skeletons.length).toBeGreaterThan(0)

    resolveFetch([])
    await flushPromises()

    expect(wrapper.findAllComponents({ name: 'SkeletonBlogRow' }).length).toBe(0)
  })

  it('handles invalid dates in formatDate', async () => {
    const posts = [{ ...mockPost, createdAt: 'invalid-date' }]
    mockFetch.mockResolvedValue(posts)
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    expect(wrapper.find('.date').text()).toBe('invalid-date')
  })

  it('renders thumbnail when post has imageUrl', async () => {
    mockFetch.mockResolvedValue([{
      ...mockPost,
      imageUrl: 'images/post-1.png'
    }])
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain('thumbnails/post-1-thumb.webp')
  })

  it('returns raw date string on formatting error', async () => {
    mockFetch.mockResolvedValue([{
      ...mockPost,
      createdAt: 'invalid-date'
    }])
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()

    expect(wrapper.text()).toContain('invalid-date')
  })

  it('throws MISSING_API_BASE when apiBase is empty string', async () => {
    mockApiBase = ''
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    expect(wrapper.text()).toContain('NUXT_PUBLIC_API_BASE_URL')
  })

  it('truncates excerpt to 140 chars when content exceeds limit', async () => {
    const longContent = 'A'.repeat(200)
    mockFetch.mockResolvedValue([{ ...mockPost, content: longContent }])
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    const text = wrapper.text()
    expect(text).toContain('A'.repeat(140) + '…')
  })
})
