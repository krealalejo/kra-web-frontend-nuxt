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

const renderDiagramsMock = vi.fn()
const reRenderMock = vi.fn()
vi.mock('~/composables/useMermaid', () => ({
  useMermaid: () => ({ renderDiagrams: renderDiagramsMock, reRender: reRenderMock }),
}))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

import RepoPage from './[repo].vue'

const mockDetail = {
  fullName: 'owner/repo',
  description: 'Test repository',
  htmlUrl: 'https://github.com/owner/repo',
  stargazersCount: 10,
  updatedAt: '2024-01-01',
  topics: ['vue', 'nuxt', 'spring-boot'],
  readmeExcerpt: '# Welcome\nTest README',
}

describe('pages/projects/[owner]/[repo].vue', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    vi.clearAllMocks()
  })

  it('renders loading state initially', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/owner/repo'
    })
    expect(wrapper.find('output[aria-label="Loading repository"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading repository…')
  })

  it('renders repository details when loaded', async () => {
    mockFetch.mockResolvedValue(mockDetail)
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/owner/repo'
    })
    await flushPromises()

    expect(wrapper.find('h1').text()).toContain('owner/repo')
    expect(wrapper.text()).toContain('Test repository')
    expect(wrapper.find('a[href="https://github.com/owner/repo"]').exists()).toBe(true)
  })

  it('renders topics list', async () => {
    mockFetch.mockResolvedValue(mockDetail)
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/owner/repo'
    })
    await flushPromises()

    expect(wrapper.text()).toContain('vue')
    expect(wrapper.text()).toContain('nuxt')
    expect(wrapper.text()).toContain('spring-boot')
  })

  it('renders the GitHub link next to the title after data loads', async () => {
    mockFetch.mockResolvedValue(mockDetail)
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/krealalejo/project-kra',
    })
    await flushPromises()

    const link = wrapper.find(`a[href="${mockDetail.htmlUrl}"]`)
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('GitHub')
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(link.find('svg').exists()).toBe(true)
  })

  it('renders the README section when readmeExcerpt is present', async () => {
    mockFetch.mockResolvedValue(mockDetail)
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/krealalejo/project-kra',
    })
    await flushPromises()
    expect(wrapper.find('h2').text()).toContain('README')
  })

  it('shows error alert when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Server error'))
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/krealalejo/project-kra',
    })
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Could not load the repository')
  })

  it('shows error alert on 404', async () => {
    mockFetch.mockRejectedValue({ statusCode: 404 })
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/owner/repo'
    })
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Repository not found')
  })

  it('shows MISSING_API_BASE error', async () => {
    mockFetch.mockRejectedValue(new Error('MISSING_API_BASE'))
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/owner/repo'
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Missing NUXT_PUBLIC_API_BASE_URL')
  })

  it('renders README content', async () => {
    mockFetch.mockResolvedValue(mockDetail)
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/owner/repo'
    })
    await flushPromises()

    expect(wrapper.text()).toContain('README')
    expect(wrapper.find('div.prose').exists()).toBe(true)
  })

  it('shows Backend project kind for backend topic', async () => {
    mockFetch.mockResolvedValue({ ...mockDetail, topics: ['backend'] })
    const wrapper = await mountSuspended(RepoPage, { route: '/projects/owner/repo' })
    await flushPromises()
    expect(wrapper.text()).toContain('Backend')
  })

  it('shows Frontend project kind for frontend topic', async () => {
    mockFetch.mockResolvedValue({ ...mockDetail, topics: ['frontend'] })
    const wrapper = await mountSuspended(RepoPage, { route: '/projects/owner/repo' })
    await flushPromises()
    expect(wrapper.text()).toContain('Frontend')
  })

  it('shows Serverless project kind for serverless topic', async () => {
    mockFetch.mockResolvedValue({ ...mockDetail, topics: ['serverless'] })
    const wrapper = await mountSuspended(RepoPage, { route: '/projects/owner/repo' })
    await flushPromises()
    expect(wrapper.text()).toContain('Serverless')
  })

  it('shows Code as default project kind for unknown topics', async () => {
    mockFetch.mockResolvedValue({ ...mockDetail, topics: [] })
    const wrapper = await mountSuspended(RepoPage, { route: '/projects/owner/repo' })
    await flushPromises()
    expect(wrapper.text()).toContain('Code')
  })

  it('re-renders mermaid diagrams when isDark theme changes', async () => {
    mockFetch.mockResolvedValue(mockDetail)
    const wrapper = await mountSuspended(RepoPage, { route: '/projects/owner/repo' })
    await flushPromises()

    const isDark = useState<boolean>('theme-is-dark')
    isDark.value = !isDark.value
    await flushPromises()

    expect(wrapper.text()).toContain('owner/repo')
  })

  it('renders no-readme placeholder when readmeExcerpt is absent', async () => {
    mockFetch.mockResolvedValue({ ...mockDetail, readmeExcerpt: null })
    const wrapper = await mountSuspended(RepoPage, { route: '/projects/owner/repo' })
    await flushPromises()
    expect(wrapper.find('div.prose').exists()).toBe(false)
  })
})
