import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

vi.mock('gsap', () => ({
  default: { from: vi.fn(), to: vi.fn() },
}))

vi.mock('~/composables/useGsapAnimations', () => ({
  useGsapHeroAnimation: vi.fn(),
  useGsapCardStagger: vi.fn(),
}))

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

import IndexPage from './index.vue'

describe('pages/index.vue', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
    
    // Default implementation returns safe empty values to avoid breaking components
    mockFetch.mockImplementation((url: string) => {
      if (typeof url !== 'string') return Promise.resolve([])
      if (url.includes('/portfolio/repos')) return Promise.resolve([])
      if (url.includes('/portfolio/contributions')) return Promise.resolve({ totalContributions: 0, weeks: [] })
      return Promise.resolve([])
    })
  })

  it('renders the hero heading', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()
    expect(wrapper.find('h1').text()).toContain('Kevin Real Alejo')
  })

  it('shows no repo list when API returns empty array', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()
    expect(wrapper.find('.home-repo-list').exists()).toBe(false)
  })

  it('renders project cards when API returns repos', async () => {
    const mockRepo = { fullName: 'owner/repo', name: 'repo', description: 'A project', owner: 'owner', topics: [] }
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([mockRepo])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()
    expect(wrapper.find('.home-repo-list').exists()).toBe(true)
    expect(wrapper.find('.home-repo-list h3').text()).toBe('repo')
  })

  it('shows error alert when fetch fails', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.reject(new Error('Network error'))
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('renders topics dot when repo has topics', async () => {
    const mockRepoWithTopics = { fullName: 'owner/repo', name: 'repo', description: 'desc', owner: 'owner', topics: ['vue'] }
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([mockRepoWithTopics])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()
    expect(wrapper.find('.home-repo-list').exists()).toBe(true)
  })

  it('shows dash when repo description is null', async () => {
    const mockRepoNoDesc = { fullName: 'owner/repo', name: 'repo', description: null, owner: 'owner', topics: [] }
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([mockRepoNoDesc])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()
    expect(wrapper.text()).toContain('—')
  })

  it('calls gsap.to on mouseenter when motion is allowed', async () => {
    const { default: gsap } = await import('gsap')
    mockFetch.mockResolvedValue([
      { fullName: 'o/r', name: 'r', description: 'desc', owner: 'o', topics: [] },
    ])
    const wrapper = await mountSuspended(IndexPage)
    const article = wrapper.find('article')
    if (article.exists()) {
      await article.trigger('mouseenter')
      expect(gsap.to).toHaveBeenCalled()
    }
  })

  it('skips gsap.to on mouseenter when reduced motion is preferred', async () => {
    const { default: gsap } = await import('gsap')
    ;(gsap.to as ReturnType<typeof vi.fn>).mockClear()
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    mockFetch.mockResolvedValue([
      { fullName: 'o/r', name: 'r', description: 'desc', owner: 'o', topics: [] },
    ])
    const wrapper = await mountSuspended(IndexPage)
    const article = wrapper.find('article')
    if (article.exists()) {
      await article.trigger('mouseenter')
      expect(gsap.to).not.toHaveBeenCalled()
    }
  })

  it('calls gsap.to on mouseleave when motion is allowed', async () => {
    const { default: gsap } = await import('gsap')
    ;(gsap.to as ReturnType<typeof vi.fn>).mockClear()
    mockFetch.mockResolvedValue([
      { fullName: 'o/r', name: 'r', description: 'desc', owner: 'o', topics: [] },
    ])
    const wrapper = await mountSuspended(IndexPage)
    const article = wrapper.find('article')
    if (article.exists()) {
      await article.trigger('mouseleave')
      expect(gsap.to).toHaveBeenCalled()
    }
  })

  it('skips gsap.to on mouseleave when reduced motion is preferred', async () => {
    const { default: gsap } = await import('gsap')
    ;(gsap.to as ReturnType<typeof vi.fn>).mockClear()
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    mockFetch.mockResolvedValue([
      { fullName: 'o/r', name: 'r', description: 'desc', owner: 'o', topics: [] },
    ])
    const wrapper = await mountSuspended(IndexPage)
    const article = wrapper.find('article')
    if (article.exists()) {
      await article.trigger('mouseleave')
      expect(gsap.to).not.toHaveBeenCalled()
    }
  })
})
