import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CvPage from './cv.vue'

describe('pages/admin/cv.vue', () => {
  it('renders the admin CV section component', async () => {
    const wrapper = await mountSuspended(CvPage)
    expect(wrapper.findComponent({ name: 'AdminCvSection' })).toBeDefined()
  })
})
