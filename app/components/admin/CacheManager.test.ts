import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import CacheManager from './CacheManager.vue'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('components/admin/CacheManager.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the API Cache section', async () => {
    const wrapper = await mountSuspended(CacheManager)
    expect(wrapper.text()).toContain('API Cache')
    expect(wrapper.text()).toContain('Flush all Memcached entries')
  })

  it('flushCache sets flushing state and shows success message', async () => {
    mockFetch.mockResolvedValue(undefined)
    const wrapper = await mountSuspended(CacheManager)
    const btn = wrapper.find('button')
    await btn.trigger('click')
    await new Promise(r => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Cache flushed successfully')
  })

  it('flushCache shows error message on failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const wrapper = await mountSuspended(CacheManager)
    const btn = wrapper.find('button')
    await btn.trigger('click')
    await new Promise(r => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Failed to flush cache')
  })

  it('shows flushing state while request is pending', async () => {
    let resolve: () => void
    const pending = new Promise<void>(r => { resolve = r })
    mockFetch.mockReturnValue(pending)
    const wrapper = await mountSuspended(CacheManager)
    const btn = wrapper.find('button')
    btn.trigger('click')
    await nextTick()
    expect(wrapper.text()).toContain('Flushing')
    resolve!()
  })
})
