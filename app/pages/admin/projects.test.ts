import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ProjectsPage from './projects.vue'

describe('pages/admin/projects.vue', () => {
  it('renders the admin projects section component', async () => {
    const wrapper = await mountSuspended(ProjectsPage)
    expect(wrapper.findComponent({ name: 'AdminProjectsSection' })).toBeDefined()
  })
})
