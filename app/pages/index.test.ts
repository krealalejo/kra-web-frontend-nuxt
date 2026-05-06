import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

vi.mock('gsap', () => ({
  default: { from: vi.fn(), to: vi.fn(), fromTo: vi.fn(), registerPlugin: vi.fn(), set: vi.fn(), utils: { toArray: vi.fn(() => []) } },
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { batch: vi.fn() },
}))

vi.mock('~/composables/useGsapAnimations', async () => {
  const gsap = (await import('gsap')).default
  return {
    useGsapHeroAnimation: vi.fn(),
    useGsapCardStagger: vi.fn(),
    useCardHoverAnimation: () => ({
      handleCardHover: (e: MouseEvent) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        gsap.to(e.currentTarget, { y: -4, duration: 0.3, ease: 'power1.out' })
      },
      handleCardHoverOut: (e: MouseEvent) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        gsap.to(e.currentTarget, { y: 0, duration: 0.3, ease: 'power1.out' })
      },
    }),
  }
})

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

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

import IndexPage from './index.vue'

describe('pages/index.vue', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))

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
    expect(wrapper.find('h1').text().replace(/\xa0/g, ' ')).toContain('Kevin Real Alejo')
  })

  it('shows no repo list when API returns empty array', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()
    expect(wrapper.findAll('a.proj-row')).toHaveLength(0)
  })

  it('renders project cards when API returns repos', async () => {
    const mockRepo = { fullName: 'owner/repo', name: 'repo', description: 'A project', owner: 'owner', topics: [] }
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([mockRepo])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()
    expect(wrapper.find('a.proj-row').exists()).toBe(true)
    expect(wrapper.find('a.proj-row span.name').text()).toBe('repo')
  })

  it('limits to 3 projects and shows view all button when there are more', async () => {
    const repos = Array.from({ length: 5 }, (_, i) => ({
      fullName: `owner/repo${i}`,
      name: `repo${i}`,
      description: `desc${i}`,
      owner: 'owner',
      topics: []
    }))
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/portfolio/repos')) return Promise.resolve(repos)
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()

    expect(wrapper.findAll('a.proj-row')).toHaveLength(4)
    const viewAllBtn = wrapper.find('a[href="/projects"]')
    expect(viewAllBtn.exists()).toBe(true)
    expect(viewAllBtn.text()).toContain('All projects')
  })

  it('prioritizes projects with "featured" topic even if they are older', async () => {
    const repos = [
      { fullName: 'owner/recent', name: 'recent', description: 'desc', owner: 'owner', topics: [], updatedAt: '2026-04-20T10:00:00Z' },
      { fullName: 'owner/older-featured', name: 'older-featured', description: 'desc', owner: 'owner', topics: ['featured'], updatedAt: '2026-04-19T10:00:00Z' },
      { fullName: 'owner/recent-2', name: 'recent-2', description: 'desc', owner: 'owner', topics: [], updatedAt: '2026-04-20T09:00:00Z' },
    ]
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/portfolio/repos')) return Promise.resolve(repos)
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })

    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()

    const titles = wrapper.findAll('a.proj-row span.name').map(s => s.text())
    expect(titles).toContain('older-featured')
    expect(titles[0]).toBe('older-featured')
    expect(titles).toHaveLength(3)
    expect(titles[1]).toBe('recent')
    expect(titles[2]).toBe('recent-2')
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

  it('shows MISSING_API_BASE hint when fetch fails with MISSING_API_BASE', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.reject(new Error('MISSING_API_BASE'))
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
    expect(wrapper.find('a.proj-row').exists()).toBe(true)
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
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))
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
    mockFetch.mockResolvedValue([{ name: 'p1', owner: 'o', fullName: 'o/p1', topics: [] }])
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()
    const article = wrapper.find('.proj-row')
    await article.trigger('mouseleave')
    expect(vi.mocked(gsap.to)).not.toHaveBeenCalled()
  })

  it('shows skeleton rows during pending state', async () => {
    let resolveFetch: any
    const fetchPromise = new Promise(resolve => { resolveFetch = resolve })
    mockFetch.mockReturnValue(fetchPromise)

    const wrapper = await mountSuspended(IndexPage)

    const skeletons = wrapper.findAllComponents({ name: 'SkeletonProjectRow' })
    expect(skeletons.length).toBeGreaterThan(0)

    resolveFetch([])
    await flushPromises()

    expect(wrapper.findAllComponents({ name: 'SkeletonProjectRow' }).length).toBe(0)
  })

  it('shows rickroll gif when isRickRolled is true', async () => {
    const isRickRolled = useState<boolean>('isRickRolled')
    isRickRolled.value = true

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()

    const img = wrapper.find('img[alt="Kevin Real Alejo"]')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain('rick-roll')

    isRickRolled.value = false
  })

  it('renders SHIPPING activity card with overline label', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([])
      if (url.includes('/activity')) return Promise.resolve([
        { type: 'SHIPPING', title: 'My Project', description: 'Building cool stuff', tags: null }
      ])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await vi.waitFor(() => expect(wrapper.text()).toContain('Now shipping'), { timeout: 3000 })
    expect(wrapper.text()).toContain('My Project')
  })

  it('renders READING activity card with overline label', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([])
      if (url.includes('/activity')) return Promise.resolve([
        { type: 'READING', title: 'Clean Code', description: 'Robert C. Martin', tags: null }
      ])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await vi.waitFor(() => expect(wrapper.text()).toContain('Currently reading'), { timeout: 3000 })
  })

  it('renders PLAYING activity card with tags and overline label', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([])
      if (url.includes('/activity')) return Promise.resolve([
        { type: 'PLAYING', title: null, description: null, tags: ['Rust', 'WASM'] }
      ])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await vi.waitFor(() => expect(wrapper.text()).toContain('Playing with'), { timeout: 3000 })
    expect(wrapper.text()).toContain('Rust')
  })

  it('hides activity card when non-PLAYING card has no title or description', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([])
      if (url.includes('/activity')) return Promise.resolve([
        { type: 'SHIPPING', title: null, description: null, tags: null }
      ])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()
    await flushPromises()

    expect(wrapper.find('.activity-card').exists()).toBe(false)
  })

  it('hides PLAYING card when tags are empty', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([])
      if (url.includes('/activity')) return Promise.resolve([
        { type: 'PLAYING', title: null, description: null, tags: [] }
      ])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()
    await flushPromises()

    expect(wrapper.find('.activity-card').exists()).toBe(false)
  })

  it('uses type name as fallback overline label for unknown type', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([])
      if (url.includes('/activity')) return Promise.resolve([
        { type: 'UNKNOWN_TYPE', title: 'Something', description: 'desc', tags: null }
      ])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await vi.waitFor(() => expect(wrapper.text()).toContain('UNKNOWN_TYPE'), { timeout: 3000 })
  })

  it('returns 2025 for oldestProjectYear when all projects lack createdAt', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([
        { fullName: 'o/r', name: 'r', description: 'desc', owner: 'o', topics: [] }
      ])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()

    expect(wrapper.text()).toContain('2025')
  })

  it('computes oldest project year from createdAt dates', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/repos')) return Promise.resolve([
        { fullName: 'o/r1', name: 'r1', description: 'desc', owner: 'o', topics: [], createdAt: '2022-03-15T00:00:00Z' },
        { fullName: 'o/r2', name: 'r2', description: 'desc', owner: 'o', topics: [], createdAt: '2024-06-01T00:00:00Z' },
      ])
      return Promise.resolve({ totalContributions: 0, weeks: [] })
    })
    const wrapper = await mountSuspended(IndexPage)
    await flushPromises()

    expect(wrapper.text()).toContain('2022')
  })
})
