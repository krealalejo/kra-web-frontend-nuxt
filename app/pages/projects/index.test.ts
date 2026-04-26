import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

vi.mock('gsap', () => ({
  default: { from: vi.fn(), to: vi.fn(), fromTo: vi.fn(), set: vi.fn() },
}))

const handleCardHoverMock = vi.fn()
const handleCardHoverOutMock = vi.fn()

vi.mock('~/composables/useGsapAnimations', () => ({
  useGsapHeroAnimation: vi.fn(),
  useGsapCardStagger: vi.fn(),
  useCardHoverAnimation: () => ({
    handleCardHover: handleCardHoverMock,
    handleCardHoverOut: handleCardHoverOutMock,
  }),
}))

const asyncDataOverride = ref<any>(null)

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

import ProjectsPage from './index.vue'

describe('pages/projects/index.vue', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    handleCardHoverMock.mockClear()
    handleCardHoverOutMock.mockClear()
    asyncDataOverride.value = null
    vi.clearAllMocks()
  })

  it('renders the main heading', async () => {
    mockFetch.mockResolvedValue([])
    const wrapper = await mountSuspended(ProjectsPage)
    await flushPromises()
    expect(wrapper.find('h1').text()).toContain('All my projects')
  })

  it('renders project cards when data is returned', async () => {
    const mockProjects = [
      { name: 'Project A', owner: 'owner', fullName: 'owner/Project A', description: 'Desc A' },
      { name: 'Project B', owner: 'owner', fullName: 'owner/Project B', description: 'Desc B' }
    ]
    mockFetch.mockResolvedValue(mockProjects)

    const wrapper = await mountSuspended(ProjectsPage)
    await flushPromises()
    const cards = wrapper.findAll('a.proj-card')
    expect(cards).toHaveLength(2)
    expect(wrapper.text()).toContain('Project A')
    expect(wrapper.text()).toContain('Project B')
  })

  it('shows empty state when no projects are returned', async () => {
    mockFetch.mockResolvedValue([])
    const wrapper = await mountSuspended(ProjectsPage)
    await flushPromises()
    expect(wrapper.text()).toContain('No projects found')
  })

  it('shows error state when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Fetch failed'))
    const wrapper = await mountSuspended(ProjectsPage)
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('API unavailable')
  })

  it('links to individual project details', async () => {
    const mockProjects = [
      { name: 'Project A', owner: 'krealalejo', fullName: 'krealalejo/Project A', description: 'Desc A' }
    ]
    mockFetch.mockResolvedValue(mockProjects)

    const wrapper = await mountSuspended(ProjectsPage)
    await flushPromises()
    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/projects/krealalejo/Project A')
  })

  it('triggers hover animations', async () => {
    const mockProjects = [{ name: 'Project A', owner: 'owner', fullName: 'owner/Project A', description: 'Desc A' }]
    mockFetch.mockResolvedValue(mockProjects)
    const wrapper = await mountSuspended(ProjectsPage)
    await flushPromises()

    const article = wrapper.find('a.proj-card')
    await article.trigger('mouseenter')
    expect(handleCardHoverMock).toHaveBeenCalled()

    await article.trigger('mouseleave')
    expect(handleCardHoverOutMock).toHaveBeenCalled()
  })

  it('shows MISSING_API_BASE hint when fetch fails with MISSING_API_BASE', async () => {
    const { useRuntimeConfig } = await import('#imports')
    const config = useRuntimeConfig()
    const originalApiBase = config.public.apiBase

    config.public.apiBase = ''

    const wrapper = await mountSuspended(ProjectsPage)
    await flushPromises()

    config.public.apiBase = originalApiBase

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('shows skeleton cards during pending state', async () => {
    let resolveFetch: any
    const fetchPromise = new Promise(resolve => { resolveFetch = resolve })
    mockFetch.mockReturnValue(fetchPromise)

    const wrapper = await mountSuspended(ProjectsPage)
    
    // We expect skeletons to be visible while pending
    const skeletons = wrapper.findAllComponents({ name: 'SkeletonProjectCard' })
    expect(skeletons.length).toBeGreaterThan(0)
    
    // Resolve fetch and wait for updates
    resolveFetch([])
    await flushPromises()
    
    expect(wrapper.findAllComponents({ name: 'SkeletonProjectCard' }).length).toBe(0)
  })

  it('correctly identifies project kinds and glyphs', async () => {
    const mockProjects = [
      { name: 'P1', owner: 'o', fullName: 'o/p1', topics: ['backend'], updatedAt: '2024-01-01T00:00:00Z' },
      { name: 'P2', owner: 'o', fullName: 'o/p2', topics: ['frontend'], updatedAt: '2024-01-01T00:00:00Z' },
      { name: 'P3', owner: 'o', fullName: 'o/p3', topics: ['serverless'], updatedAt: '2024-01-01T00:00:00Z' },
      { name: 'P4', owner: 'o', fullName: 'o/p4', topics: ['other'], updatedAt: '2024-01-01T00:00:00Z' }
    ]
    mockFetch.mockResolvedValue(mockProjects)
    const wrapper = await mountSuspended(ProjectsPage)
    await flushPromises()

    const cards = wrapper.findAll('.proj-card')
    expect(cards[0].text()).toContain('Backend')
    expect(cards[1].text()).toContain('Frontend')
    expect(cards[2].text()).toContain('Serverless')
    expect(cards[3].text()).toContain('Code')
    
    expect(cards[0].find('.glyph').text()).toBe('α')
    expect(cards[1].find('.glyph').text()).toBe('w')
    expect(cards[2].find('.glyph').text()).toBe('λ')
    expect(cards[3].find('.glyph').text()).toBe('P')
  })
})
