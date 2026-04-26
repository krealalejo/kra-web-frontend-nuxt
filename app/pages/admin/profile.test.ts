import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ProfilePage from './profile.vue'

describe('pages/admin/profile.vue', () => {
  it('renders the profile section component', async () => {
    const wrapper = await mountSuspended(ProfilePage)
    expect(wrapper.findComponent({ name: 'AdminProfileSection' })).toBeDefined()
  })
})
