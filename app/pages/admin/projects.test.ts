import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ProjectsPage from './projects.vue'

describe('pages/admin/projects.vue', () => {
  it('renders the admin projects section component', async () => {
    const wrapper = shallowMount(ProjectsPage)
    expect(wrapper.findComponent({ name: 'AdminProjectsSection' })).toBeDefined()
  })
})
