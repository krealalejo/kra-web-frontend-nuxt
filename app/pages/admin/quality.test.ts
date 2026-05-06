import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import QualityPage from './quality.vue'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('pages/admin/quality.vue', () => {
  it('renders the Code Quality heading', async () => {
    const wrapper = await mountSuspended(QualityPage)
    expect(wrapper.find('h1').text()).toBe('Code Quality')
  })

  it('renders all three project cards', async () => {
    const wrapper = await mountSuspended(QualityPage)
    const cards = wrapper.findAll('.flex.flex-col.gap-6')
    expect(cards).toHaveLength(3)

    expect(cards[0]!.find('h2').text()).toBe('kra-api')
    expect(cards[1]!.find('h2').text()).toBe('kra-web-frontend-nuxt')
    expect(cards[2]!.find('h2').text()).toBe('kra-lambdas')
  })

  it('renders project badges with correct sources', async () => {
    const wrapper = await mountSuspended(QualityPage)
    const badges = wrapper.findAll('img')
    expect(badges).toHaveLength(3)
    expect(badges[0]!.attributes('src')).toContain('project=krealalejo_kra-api')
  })

  it('renders "View Report" links with correct hrefs', async () => {
    const wrapper = await mountSuspended(QualityPage)
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(3)
    expect(links[0]!.attributes('href')).toContain('sonarcloud.io/summary/new_code?id=krealalejo_kra-api')
  })

  it('flushCache sets flushing state and shows success message', async () => {
    mockFetch.mockResolvedValue(undefined)
    const wrapper = await mountSuspended(QualityPage)
    const btn = wrapper.findAll('button').find(b => b.text().includes('Flush Cache'))
    await btn!.trigger('click')
    await new Promise(r => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Cache flushed successfully')
  })

  it('flushCache shows error message on failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const wrapper = await mountSuspended(QualityPage)
    const btn = wrapper.findAll('button').find(b => b.text().includes('Flush Cache'))
    await btn!.trigger('click')
    await new Promise(r => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Failed to flush cache')
  })

  it('shows flushing state while request is pending', async () => {
    let resolve: () => void
    const pending = new Promise<void>(r => { resolve = r })
    mockFetch.mockReturnValue(pending)
    const wrapper = await mountSuspended(QualityPage)
    const btn = wrapper.findAll('button').find(b => b.text().includes('Flush Cache'))
    btn!.trigger('click')
    await nextTick()
    expect(wrapper.text()).toContain('Flushing')
    resolve!()
  })

  it('renders the API Cache section', async () => {
    const wrapper = await mountSuspended(QualityPage)
    expect(wrapper.text()).toContain('API Cache')
    expect(wrapper.text()).toContain('Flush all Memcached entries')
  })
})
