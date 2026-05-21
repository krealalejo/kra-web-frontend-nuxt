import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ProfilePage from './profile.vue'

describe('pages/admin/profile.vue', () => {
  it('renders the profile section component', () => {
    const wrapper = shallowMount(ProfilePage)
    expect(wrapper.findComponent({ name: 'AdminProfileSection' })).toBeDefined()
  })
})
