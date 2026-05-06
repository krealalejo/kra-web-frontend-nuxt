import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

let mockContribApiBase = 'http://localhost:8080'

mockNuxtImport('useRuntimeConfig', () => {
  return () => ({
    public: { apiBase: mockContribApiBase },
    app: { baseURL: '/', buildAssetsDir: '/_nuxt/', cdnURL: '' }
  })
})

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

import AppGithubContributions from './AppGithubContributions.vue'

describe('components/AppGithubContributions.vue', () => {
  beforeEach(() => {
    mockContribApiBase = 'http://localhost:8080'
    mockFetch.mockReset()

    const currentYear = new Date().getFullYear()

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/contributions')) {
        return Promise.resolve({
          totalContributions: 100,
          weeks: [
            {
              contributionDays: [
                { contributionCount: 0, date: `${currentYear}-01-01`, color: '#ebedf0' },
                { contributionCount: 5, date: `${currentYear}-01-02`, color: '#9be9a8' },
                { contributionCount: 15, date: `${currentYear}-01-03`, color: '#40c463' }
              ]
            }
          ]
        })
      }
      return Promise.resolve([])
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the component with data correctly', async () => {
    const wrapper = await mountSuspended(AppGithubContributions)
    await flushPromises()

    expect(wrapper.text()).toContain('GitHub Activity')
    expect(wrapper.text()).toContain('20')
    expect(wrapper.find('.gh-graph').exists()).toBe(true)
  })

  it('renders current year on desktop', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })
    window.dispatchEvent(new Event('resize'))

    const wrapper = await mountSuspended(AppGithubContributions)
    await flushPromises()

    const currentYear = new Date().getFullYear().toString()
    expect(wrapper.text()).toContain(currentYear)
  })

  it('renders current year on mobile', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 })
    window.dispatchEvent(new Event('resize'))

    const wrapper = await mountSuspended(AppGithubContributions)
    await flushPromises()

    const currentYear = new Date().getFullYear().toString()
    expect(wrapper.text()).toContain(currentYear)
  })

  it('handles error state', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/contributions')) return Promise.reject(new Error('Network error'))
      return Promise.resolve([])
    })

    const wrapper = await mountSuspended(AppGithubContributions)
    await flushPromises()

    expect(wrapper.text()).toContain('API unavailable')
  })

  it('renders cells for all level values (0-4)', async () => {
    const currentYear = new Date().getFullYear()
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/contributions')) {
        return Promise.resolve({
          totalContributions: 20,
          weeks: [{
            contributionDays: [
              { contributionCount: 0, date: `${currentYear}-02-01` },
              { contributionCount: 1, date: `${currentYear}-02-02` },
              { contributionCount: 4, date: `${currentYear}-02-03` },
              { contributionCount: 7, date: `${currentYear}-02-04` },
              { contributionCount: 12, date: `${currentYear}-02-05` },
            ]
          }]
        })
      }
      return Promise.resolve([])
    })

    const wrapper = await mountSuspended(AppGithubContributions)
    await flushPromises()

    const cells = wrapper.findAll('.gh-graph .cell')
    const levels = cells.map(c => c.attributes('data-l'))
    expect(levels).toContain('0')
    expect(levels).toContain('1')
    expect(levels).toContain('2')
    expect(levels).toContain('3')
    expect(levels).toContain('4')
  })

  it('filters out prior-year days as empty cells', async () => {
    const currentYear = new Date().getFullYear()
    const priorYear = currentYear - 1
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/contributions')) {
        return Promise.resolve({
          totalContributions: 5,
          weeks: [{
            contributionDays: [
              { contributionCount: 3, date: `${priorYear}-12-31` },
              { contributionCount: 5, date: `${currentYear}-01-01` },
            ]
          }]
        })
      }
      return Promise.resolve([])
    })

    const wrapper = await mountSuspended(AppGithubContributions)
    await flushPromises()

    const emptyCells = wrapper.findAll('.cell.is-empty')
    expect(emptyCells.length).toBeGreaterThan(0)
  })

  it('renders month labels for multi-month data', async () => {
    const currentYear = new Date().getFullYear()
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/portfolio/contributions')) {
        return Promise.resolve({
          totalContributions: 10,
          weeks: [
            { contributionDays: [{ contributionCount: 1, date: `${currentYear}-01-01` }] },
            { contributionDays: [{ contributionCount: 1, date: `${currentYear}-02-01` }] },
            { contributionDays: [{ contributionCount: 1, date: `${currentYear}-03-01` }] },
          ]
        })
      }
      return Promise.resolve([])
    })

    const wrapper = await mountSuspended(AppGithubContributions)
    await flushPromises()

    const monthDivs = wrapper.findAll('.gh-months .month')
    expect(monthDivs.length).toBeGreaterThanOrEqual(3)
    const text = wrapper.find('.gh-months').text()
    expect(text).toContain('Jan')
    expect(text).toContain('Feb')
    expect(text).toContain('Mar')
  })

  it('shows error state when apiBase is empty (MISSING_API_BASE)', async () => {
    mockContribApiBase = ''
    const wrapper = await mountSuspended(AppGithubContributions)
    await flushPromises()
    expect(wrapper.text()).toContain('API unavailable')
  })
})
