import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

vi.mock('gsap', () => ({
  default: { from: vi.fn(), to: vi.fn() },
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
  return async (_key: string, factory: () => Promise<any>) => {
    if (asyncDataOverride.value) return asyncDataOverride.value
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
    const cards = wrapper.findAll('li')
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
    expect(wrapper.text()).toContain('Error loading projects')
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

    const article = wrapper.find('article')
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

  it('shows loading state when pending', async () => {
    asyncDataOverride.value = { 
      data: ref(null), 
      pending: ref(true), 
      error: ref(null), 
      status: ref('pending'), 
      refresh: vi.fn() 
    }
    
    const wrapper = await mountSuspended(ProjectsPage)
    expect(wrapper.text()).toContain('Loading projects…')
  })

  it('renders default description when missing', async () => {
    mockFetch.mockResolvedValue([{ 
      name: 'Project A', owner: 'owner', fullName: 'owner/Project A', 
      description: null 
    }])
    const wrapper = await mountSuspended(ProjectsPage)
    await flushPromises()
    expect(wrapper.text()).toContain('No description available.')
  })
})
