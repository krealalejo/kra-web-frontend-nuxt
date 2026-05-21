import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import CallbackPage from './callback.vue'

describe('pages/admin/callback.vue', () => {
  it('renders without crashing', async () => {
    const wrapper = shallowMount(CallbackPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('shows a "Verifying login" message', async () => {
    const wrapper = shallowMount(CallbackPage)
    expect(wrapper.text()).toContain('Verifying login')
  })

  it('shows a "Please wait" message', async () => {
    const wrapper = shallowMount(CallbackPage)
    expect(wrapper.text()).toContain('Please wait')
  })
})
