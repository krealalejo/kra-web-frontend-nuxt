import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ProjectSidebar from './ProjectSidebar.vue'

describe('components/ProjectSidebar.vue', () => {
  it('renders fixed README link in TOC', async () => {
    const wrapper = await mountSuspended(ProjectSidebar)
    const readmeLink = wrapper.find('a[href="#readme"]')
    expect(readmeLink.exists()).toBe(true)
    expect(readmeLink.text()).toBe('README')
  })

  it('renders headings in TOC when provided', async () => {
    const headings = [
      { title: 'Introduction', id: 'intro' },
      { title: 'Usage', id: 'usage' }
    ]
    const wrapper = await mountSuspended(ProjectSidebar, {
      props: { headings }
    })
    const links = wrapper.findAll('.toc li a')
    expect(links).toHaveLength(3) // README + 2 headings
    expect(links[1].text()).toBe('Introduction')
    expect(links[1].attributes('href')).toBe('#intro')
  })

  it('renders project facts when provided', async () => {
    const wrapper = await mountSuspended(ProjectSidebar, {
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
    const wrapper = await mountSuspended(ProjectSidebar, {
      props: { stack }
    })
    const chips = wrapper.findAll('.stack-chip')
    expect(chips).toHaveLength(3)
    expect(chips[0].text()).toBe('Nuxt')
  })

  it('does not render stack section if empty', async () => {
    const wrapper = await mountSuspended(ProjectSidebar, {
      props: { stack: [] }
    })
    expect(wrapper.find('.stack').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('STACK')
  })
})
