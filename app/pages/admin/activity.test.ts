import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ActivityPage from './activity.vue'

describe('pages/admin/activity.vue', () => {
  it('renders the activity section component', async () => {
    const wrapper = await mountSuspended(ActivityPage)
    expect(wrapper.findComponent({ name: 'AdminActivitySection' })).toBeDefined()
  })
})
