import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import CvPage from './cv.vue'

describe('pages/admin/cv.vue', () => {
  it('renders the admin CV section component', async () => {
    const wrapper = shallowMount(CvPage)
    expect(wrapper.findComponent({ name: 'AdminCvSection' })).toBeDefined()
  })
})
