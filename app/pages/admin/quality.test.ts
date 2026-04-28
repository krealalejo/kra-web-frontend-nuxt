import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import QualityPage from './quality.vue'

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
})
