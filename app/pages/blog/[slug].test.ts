import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

mockNuxtImport('useAsyncData', () => {
  return (key: string | (() => string), factory: () => Promise<any>, options?: any) => {
    if (typeof key === 'function') key()
    const data = ref(null)
    const pending = ref(!options?.lazy)
    const error = ref(null)
    const status = ref('idle')

    factory().then(res => {
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

vi.mock('gsap', () => ({
  default: { 
    from: vi.fn(), 
    to: vi.fn(), 
    fromTo: vi.fn(), 
    set: vi.fn(),
    utils: {
      toArray: vi.fn((val) => (typeof val === 'string' ? [val] : val))
    }
  },
}))

const renderDiagramsMock = vi.fn()
vi.mock('~/composables/useMermaid', () => ({
  useMermaid: () => ({ renderDiagrams: renderDiagramsMock }),
}))

vi.mock('marked', () => {
  class Renderer {
    heading = vi.fn()
    paragraph = vi.fn((text: string) => text)
    text = vi.fn((text: string) => text)
  }
  return {
    marked: { parse: vi.fn().mockImplementation((text: string) => `<p>${text}</p>`), Renderer },
    Renderer,
  }
})

vi.mock('dompurify', () => ({
  default: { sanitize: (html: string) => html },
}))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

import BlogSlugPage from './[slug].vue'

const mockPost = {
  slug: 'my-post',
  title: 'My Post Title',
  content: 'This is the **content**.',
  createdAt: '2024-03-01T12:00:00Z',
  updatedAt: '2024-03-01T12:00:00Z',
  references: [],
}

describe('pages/blog/[slug].vue', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('renders the back link', async () => {
    mockFetch.mockResolvedValue(mockPost)
    const wrapper = await mountSuspended(BlogSlugPage, { route: '/blog/my-post' })
    await flushPromises()
    const backLink = wrapper.find('a[href="/blog"]')
    expect(backLink.exists()).toBe(true)
    expect(backLink.text()).toContain('All posts')
  })

  it('renders post title when loaded', async () => {
    mockFetch.mockResolvedValue(mockPost)
    const wrapper = await mountSuspended(BlogSlugPage, { route: '/blog/my-post' })
    await flushPromises()
    expect(wrapper.find('h1').text()).toContain('My Post Title')
  })

  it('renders the formatted creation date', async () => {
    mockFetch.mockResolvedValue(mockPost)
    const wrapper = await mountSuspended(BlogSlugPage, { route: '/blog/my-post' })
    await flushPromises()
    const dateEl = wrapper.find('.overline-meta')
    expect(dateEl.exists()).toBe(true)
    expect(dateEl.text().length).toBeGreaterThan(0)
  })

  it('renders references section when post has references', async () => {
    mockFetch.mockResolvedValue({
      ...mockPost,
      references: [{ label: 'Example', url: 'https://example.com' }],
    })
    const wrapper = await mountSuspended(BlogSlugPage, { route: '/blog/my-post' })
    await flushPromises()
    expect(wrapper.find('section[aria-label="References"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('References')
  })

  it('does not render references section when post has no references', async () => {
    mockFetch.mockResolvedValue({ ...mockPost, references: [] })
    const wrapper = await mountSuspended(BlogSlugPage, { route: '/blog/my-post' })
    await flushPromises()
    expect(wrapper.find('section[aria-label="References"]').exists()).toBe(false)
  })

  it('shows error alert when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('API error'))
    const wrapper = await mountSuspended(BlogSlugPage, { route: '/blog/bad-slug' })
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('shows "Post not found" when API returns 404', async () => {
    mockFetch.mockRejectedValue({ statusCode: 404 })
    const wrapper = await mountSuspended(BlogSlugPage, { route: '/blog/ghost' })
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('not found')
  })

  it('shows MISSING_API_BASE hint when api base is missing', async () => {
    mockFetch.mockRejectedValue(new Error('MISSING_API_BASE'))
    const wrapper = await mountSuspended(BlogSlugPage, { route: '/blog/my-post' })
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('NUXT_PUBLIC_API_BASE_URL')
  })

  it('shows "updated" date when updatedAt differs from createdAt', async () => {
    mockFetch.mockResolvedValue({
      ...mockPost,
      updatedAt: '2024-04-01T12:00:00Z',
    })
    const wrapper = await mountSuspended(BlogSlugPage, { route: '/blog/my-post' })
    await flushPromises()
    expect(wrapper.text()).toContain('Updated')
  })

  it('triggers mermaid rendering when content is updated', async () => {
    mockFetch.mockResolvedValue(mockPost)
    const wrapper = await mountSuspended(BlogSlugPage, { route: '/blog/my-post' })
    await flushPromises()
    expect(renderDiagramsMock).toHaveBeenCalled()
  })

  it('returns raw iso date on format error', async () => {
    mockFetch.mockResolvedValue({
      ...mockPost,
      createdAt: 'invalid-date'
    })
    const wrapper = await mountSuspended(BlogSlugPage, { route: '/blog/my-post' })
    await flushPromises()
    expect(wrapper.text()).toContain('invalid-date')
  })

  it('throws 400 error when slug is empty', async () => {
    mockFetch.mockRejectedValue({ statusCode: 400, statusMessage: 'Invalid post slug' })
    const wrapper = await mountSuspended(BlogSlugPage, { route: '/blog/' })
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('renders thumbnail when imageUrl is present', async () => {
    mockFetch.mockResolvedValue({
      ...mockPost,
      imageUrl: 'images/header.jpg'
    })
    const wrapper = await mountSuspended(BlogSlugPage, { route: '/blog/my-post' })
    await flushPromises()

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain('thumbnails/header-thumb.webp')
  })
})
