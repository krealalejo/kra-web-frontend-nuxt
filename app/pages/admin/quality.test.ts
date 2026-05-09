import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import QualityPage from './quality.vue'

describe('pages/admin/quality.vue', () => {
  it('renders the Code Quality heading', async () => {
    const wrapper = await mountSuspended(QualityPage)
    expect(wrapper.find('h1').text()).toBe('Code Quality')
    expect(wrapper.text()).toContain('Monitoring project health and quality metrics via SonarCloud.')
  })

  it('contains the child components', async () => {
    const wrapper = await mountSuspended(QualityPage)
    
    // Check for components by checking for their respective container structures or text
    // since in Vue Test Utils suspended mounts, child components will be rendered inline
    expect(wrapper.text()).toContain('kra-api') // From SonarCloudDashboard
    expect(wrapper.text()).toContain('System Health (AWS)') // From CloudWatchDashboard
    expect(wrapper.text()).toContain('API Cache') // From CacheManager
  })
})
