import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SonarCloudDashboard from './SonarCloudDashboard.vue'

describe('components/admin/SonarCloudDashboard.vue', () => {
  it('renders all three project cards', async () => {
    const wrapper = await mountSuspended(SonarCloudDashboard)
    const cards = wrapper.findAll('.flex.flex-col.gap-6')
    expect(cards).toHaveLength(3)

    expect(cards[0]!.find('h2').text()).toBe('kra-api')
    expect(cards[1]!.find('h2').text()).toBe('kra-web-frontend-nuxt')
    expect(cards[2]!.find('h2').text()).toBe('kra-lambdas')
  })

  it('renders project badges with correct sources', async () => {
    const wrapper = await mountSuspended(SonarCloudDashboard)
    const badges = wrapper.findAll('img')
    expect(badges).toHaveLength(3)
    expect(badges[0]!.attributes('src')).toContain('project=krealalejo_kra-api')
  })

  it('renders "View Report" links with correct hrefs', async () => {
    const wrapper = await mountSuspended(SonarCloudDashboard)
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(3)
    expect(links[0]!.attributes('href')).toContain('sonarcloud.io/summary/new_code?id=krealalejo_kra-api')
  })

  it('renders the info box', async () => {
    const wrapper = await mountSuspended(SonarCloudDashboard)
    expect(wrapper.text()).toContain('The quality gate status is updated automatically')
  })
})
