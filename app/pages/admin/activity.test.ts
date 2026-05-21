import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ActivityPage from './activity.vue'

describe('pages/admin/activity.vue', () => {
  it('renders the activity section component', async () => {
    const wrapper = shallowMount(ActivityPage)
    expect(wrapper.findComponent({ name: 'AdminActivitySection' })).toBeDefined()
  })
})
