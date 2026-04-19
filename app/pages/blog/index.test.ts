import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

mockNuxtImport('useAsyncData', () => {
  return async (_key: string, factory: () => Promise<any>) => {
    try {
      const res = await factory()
      return { 
        data: ref(res), 
        pending: ref(false), 
        error: ref(null),
        status: ref('success'),
        refresh: vi.fn()
      }
    } catch (e) {
      return { 
        data: ref(null), 
        pending: ref(false), 
        error: ref(e),
        status: ref('error'),
        refresh: vi.fn()
      }
    }
  }
})

vi.mock('~/composables/useGsapAnimations', () => ({
  useGsapCardStagger: vi.fn(),
}))

import BlogIndexPage from './index.vue'

// Cleanup helper to avoid data leakage between tests
const clearData = () => {
  try {
    // @ts-ignore
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
  it('renders the Blog heading', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    expect(wrapper.find('h1').text()).toBe('Blog')
  })

  it('renders post titles when posts are loaded', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    expect(wrapper.find('.blog-post-list').exists()).toBe(true)
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
    const dateEl = wrapper.find('.blog-post-list li p.text-xs')
    expect(dateEl.exists()).toBe(true)
    expect(dateEl.text().length).toBeGreaterThan(0)
  })

  it('links to individual post pages', async () => {
    mockFetch.mockResolvedValue([mockPost])
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    const links = wrapper.findAll('a').filter(a => a.attributes('href')?.includes('/blog/'))
    expect(links.length).toBeGreaterThan(0)
    expect(links[0].attributes('href')).toBe('/blog/hello-world')
  })

  it('shows an error state when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('API error'))
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Could not load posts')
  })

  it('shows NUXT_PUBLIC_API_BASE_URL hint for MISSING_API_BASE errors', async () => {
    mockFetch.mockRejectedValue(new Error('MISSING_API_BASE'))
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    expect(wrapper.text()).toContain('NUXT_PUBLIC_API_BASE_URL')
  })

  it('shows Spring Boot hint for generic API errors', async () => {
    mockFetch.mockRejectedValue(new Error('Connection refused'))
    const wrapper = await mountSuspended(BlogIndexPage)
    await flushPromises()
    expect(wrapper.text()).toContain('Spring Boot')
  })
})
