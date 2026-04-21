import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

vi.mock('gsap', () => ({
  default: { from: vi.fn(), to: vi.fn() },
}))

vi.mock('~/composables/useGsapAnimations', () => ({
  useGsapHeroAnimation: vi.fn(),
  useGsapCardStagger: vi.fn(),
  useCardHoverAnimation: () => ({
    handleCardHover: vi.fn(),
    handleCardHoverOut: vi.fn(),
  }),
}))

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

import ProjectsPage from './index.vue'

describe('pages/projects/index.vue', () => {
  beforeEach(() => {
    mockFetch.mockReset()
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
})
