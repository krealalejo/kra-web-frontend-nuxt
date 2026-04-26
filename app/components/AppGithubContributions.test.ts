import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

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

import AppGithubContributions from './AppGithubContributions.vue'

describe('components/AppGithubContributions.vue', () => {
  beforeEach(() => {
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
})
