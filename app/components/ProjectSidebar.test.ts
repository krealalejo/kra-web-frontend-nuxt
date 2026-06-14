import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectSidebar from './ProjectSidebar.vue'

describe('components/ProjectSidebar.vue', () => {
  it('renders empty TOC when no headings provided', async () => {
    const wrapper = mount(ProjectSidebar)
    const links = wrapper.findAll('.toc li a')
    expect(links).toHaveLength(0)
  })

  it('renders headings in TOC when provided', async () => {
    const headings = [
      { title: 'Introduction', id: 'intro' },
      { title: 'Usage', id: 'usage' }
    ]
    const wrapper = mount(ProjectSidebar, {
      props: { headings }
    })
    const links = wrapper.findAll('.toc li a')
    expect(links).toHaveLength(2)
    expect(links[0].text()).toBe('Introduction')
    expect(links[0].attributes('href')).toBe('#intro')
  })

  it('renders project facts when provided', async () => {
    const wrapper = mount(ProjectSidebar, {
      props: {
        role: 'Architect',
        year: '2024',
        kind: 'Personal',
        stars: 123,
        mainBranch: 'develop'
      }
    })
    expect(wrapper.text()).toContain('Architect')
    expect(wrapper.text()).toContain('2024')
    expect(wrapper.text()).toContain('Personal')
    expect(wrapper.text()).toContain('123')
    expect(wrapper.text()).toContain('develop')
  })

  it('renders stack chips when provided', async () => {
    const stack = ['Nuxt', 'Vitest', 'Tailwind']
    const wrapper = mount(ProjectSidebar, {
      props: { stack }
    })
    const chips = wrapper.findAll('.stack-chip')
    expect(chips).toHaveLength(3)
    expect(chips[0].text()).toBe('Nuxt')
  })

  it('does not render stack section if empty', async () => {
    const wrapper = mount(ProjectSidebar, {
      props: { stack: [] }
    })
    expect(wrapper.find('.stack').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('STACK')
  })

  it('renders the GitHub button when htmlUrl is provided', async () => {
    const htmlUrl = 'https://github.com/owner/repo'
    const wrapper = mount(ProjectSidebar, {
      props: { htmlUrl }
    })
    const btn = wrapper.find('.sidebar-github-btn')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('href')).toBe(htmlUrl)
    expect(btn.text()).toContain('View on GitHub')
  })

  it('does not render the GitHub button when htmlUrl is absent', async () => {
    const wrapper = mount(ProjectSidebar)
    expect(wrapper.find('.sidebar-github-btn').exists()).toBe(false)
  })
})
