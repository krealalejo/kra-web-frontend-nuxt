import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

mockNuxtImport('useAsyncData', () => {
  return (_key: string, factory: () => Promise<any>) => {
    const data = ref(null)
    const pending = ref(true)
    const error = ref(null)

    factory().then(res => {
      data.value = res
      pending.value = false
    }).catch(err => {
      error.value = err
      pending.value = false
    })

    return { data, pending, error }
  }
})

vi.mock('gsap', () => ({
  default: { from: vi.fn(), to: vi.fn() },
}))

const renderDiagramsMock = vi.fn()
vi.mock('~/composables/useMermaid', () => ({
  useMermaid: () => ({ renderDiagrams: renderDiagramsMock }),
}))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

import RepoDetailPage from './[repo].vue'

const mockRepo = {
  fullName: 'owner/repo',
  description: 'Test repository',
  htmlUrl: 'https://github.com/owner/repo',
  stargazersCount: 10,
  updatedAt: '2024-01-01',
  topics: ['vue', 'nuxt'],
  readmeExcerpt: '# Welcome\nTest README',
}

describe('pages/projects/[owner]/[repo].vue', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    vi.clearAllMocks()
  })

  it('renders loading state initially', async () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // Never resolves
    const wrapper = await mountSuspended(RepoDetailPage, {
      route: '/projects/owner/repo'
    })
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading repository…')
  })

  it('renders repository details when loaded', async () => {
    mockFetch.mockResolvedValue(mockRepo)
    const wrapper = await mountSuspended(RepoDetailPage, {
      route: '/projects/owner/repo'
    })
    await flushPromises()
    
    expect(wrapper.find('h1').text()).toContain('owner/repo')
    expect(wrapper.text()).toContain('Test repository')
    expect(wrapper.find('a[href="https://github.com/owner/repo"]').exists()).toBe(true)
  })

  it('renders topics list', async () => {
    mockFetch.mockResolvedValue(mockRepo)
    const wrapper = await mountSuspended(RepoDetailPage, {
      route: '/projects/owner/repo'
    })
    await flushPromises()
    
    expect(wrapper.text()).toContain('vue')
    expect(wrapper.text()).toContain('nuxt')
  })

  it('shows error alert on 404', async () => {
    mockFetch.mockRejectedValue({ statusCode: 404 })
    const wrapper = await mountSuspended(RepoDetailPage, {
      route: '/projects/owner/repo'
    })
    await flushPromises()
    
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Repository not found')
  })

  it('shows MISSING_API_BASE error', async () => {
    mockFetch.mockRejectedValue(new Error('MISSING_API_BASE'))
    const wrapper = await mountSuspended(RepoDetailPage, {
      route: '/projects/owner/repo'
    })
    await flushPromises()
    
    expect(wrapper.text()).toContain('Missing NUXT_PUBLIC_API_BASE_URL')
  })

  it('renders README content', async () => {
    mockFetch.mockResolvedValue(mockRepo)
    const wrapper = await mountSuspended(RepoDetailPage, {
      route: '/projects/owner/repo'
    })
    await flushPromises()
    
    expect(wrapper.text()).toContain('README')
    expect(wrapper.find('div.prose').exists()).toBe(true)
  })
})
