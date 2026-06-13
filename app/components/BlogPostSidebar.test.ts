import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogPostSidebar from './BlogPostSidebar.vue'

describe('BlogPostSidebar', () => {
  it('renders TOC with active link and h3 indentation', () => {
    const wrapper = mount(BlogPostSidebar, {
      props: {
        tocItems: [
          { id: 'intro', text: 'Intro', level: 2 },
          { id: 'detail', text: 'Detail', level: 3 },
        ],
        activeTocId: 'detail',
        readingTime: 5,
        publishedAt: '24.01.01',
        updatedAt: '24.02.02',
        references: [{ url: 'https://example.com', label: 'Example' }],
      },
    })

    const html = wrapper.html()
    expect(html).toContain('ON THIS PAGE')
    expect(wrapper.find('.toc-h3').exists()).toBe(true)
    expect(wrapper.find('a.active').text()).toBe('Detail')
    expect(html).toContain('READ TIME')
    expect(html).toContain('5 min')
    expect(html).toContain('PUBLISHED')
    expect(html).toContain('UPDATED')
    expect(html).toContain('REFERENCES')
    expect(wrapper.find('a[href="https://example.com"]').text()).toBe('Example')
  })

  it('omits optional sections when props are absent', () => {
    const wrapper = mount(BlogPostSidebar, {
      props: {},
    })

    const html = wrapper.html()
    expect(html).not.toContain('ON THIS PAGE')
    expect(html).not.toContain('READ TIME')
    expect(html).not.toContain('PUBLISHED')
    expect(html).not.toContain('UPDATED')
    expect(html).not.toContain('REFERENCES')
    expect(html).toContain('POST INFO')
  })

  it('hides UPDATED when it equals publishedAt', () => {
    const wrapper = mount(BlogPostSidebar, {
      props: {
        publishedAt: '24.01.01',
        updatedAt: '24.01.01',
      },
    })
    expect(wrapper.html()).not.toContain('UPDATED')
    expect(wrapper.html()).toContain('PUBLISHED')
  })
})
