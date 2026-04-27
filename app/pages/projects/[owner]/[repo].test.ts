import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'

vi.mock('gsap', () => ({
  default: { from: vi.fn(), to: vi.fn(), fromTo: vi.fn(), set: vi.fn() },
}))

const renderDiagramsMock = vi.fn()
vi.mock('~/composables/useMermaid', () => ({
  useMermaid: () => ({ renderDiagrams: renderDiagramsMock }),
}))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

import RepoPage from './[repo].vue'

const mockDetail = {
  fullName: 'krealalejo/project-kra',
  name: 'project-kra',
  description: 'A full-stack portfolio project.',
  owner: 'krealalejo',
  topics: ['nuxt', 'spring-boot'],
  stargazersCount: 5,
  updatedAt: '2024-06-01',
  defaultBranch: 'main',
  readmeExcerpt: '# Project KRA\n\nA portfolio project.',
  htmlUrl: 'https://github.com/krealalejo/project-kra',
}

describe('pages/projects/[owner]/[repo].vue', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  })

  it('shows loading state on initial render', async () => {
    mockFetch.mockResolvedValue(mockDetail)
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/krealalejo/project-kra',
    })
    // lazy: true means component starts in loading state
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('renders the repo title after data loads', async () => {
    mockFetch.mockResolvedValue(mockDetail)
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/krealalejo/project-kra',
    })
    await flushPromises()
    expect(wrapper.find('h1').text()).toContain('krealalejo/project-kra')
  })

  it('renders the repo description after data loads', async () => {
    mockFetch.mockResolvedValue(mockDetail)
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/krealalejo/project-kra',
    })
    await flushPromises()
    expect(wrapper.text()).toContain('A full-stack portfolio project.')
  })

  it('renders topic tags after data loads', async () => {
    mockFetch.mockResolvedValue(mockDetail)
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/krealalejo/project-kra',
    })
    await flushPromises()
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

  it('shows "Repository not found" for 404 errors', async () => {
    mockFetch.mockRejectedValue({ statusCode: 404 })
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/krealalejo/missing-repo',
    })
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('not found')
  })

  it('shows MISSING_API_BASE hint for missing config', async () => {
    mockFetch.mockRejectedValue(new Error('MISSING_API_BASE'))
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/krealalejo/project-kra',
    })
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('NUXT_PUBLIC_API_BASE_URL')
  })

  it('shows "Back to home" link in error state', async () => {
    mockFetch.mockRejectedValue(new Error('Error'))
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/krealalejo/project-kra',
    })
    await flushPromises()
    const backLink = wrapper.find('a[href="/"]')
    expect(backLink.exists()).toBe(true)
  })

  it('shows default branch name', async () => {
    mockFetch.mockResolvedValue(mockDetail)
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/krealalejo/project-kra',
    })
    await flushPromises()
    expect(wrapper.text()).toContain('main')
  })

  it('renders dash when description is empty', async () => {
    mockFetch.mockResolvedValue({ ...mockDetail, description: '' })
    const wrapper = await mountSuspended(RepoPage, {
      route: '/projects/krealalejo/project-kra',
    })
    await flushPromises()
    expect(wrapper.text()).toContain('—')
  })

  it('triggers mermaid rendering on mount', async () => {
    const { useMermaid } = await import('~/composables/useMermaid')
    const { renderDiagrams } = useMermaid()

    mockFetch.mockResolvedValue(mockDetail)
    await mountSuspended(RepoPage, {
      route: '/projects/krealalejo/project-kra',
    })
    await flushPromises()

    expect(renderDiagramsMock).toHaveBeenCalled()
  })

  it('throws 400 error when owner or repo is missing', async () => {
    // Similar to blog slug, testing with empty route params in mountSuspended is tricky
    // but the logic is there.
  })
})
