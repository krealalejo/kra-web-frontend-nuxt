import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BlogPostTable from './BlogPostTable.vue'

describe('components/BlogPostTable.vue', () => {
  const mockPosts = [
    {
      slug: 'test-1',
      title: 'Test Post 1',
      content: 'Content 1',
      createdAt: '2023-01-01T10:00:00Z',
      updatedAt: '2023-01-01T10:00:00Z',
    },
    {
      slug: 'test-2',
      title: 'Test Post 2',
      content: 'Content 2',
      createdAt: '2023-02-01T10:00:00Z',
      updatedAt: '2023-02-01T10:00:00Z',
    }
  ]

  it('renders a list of posts', async () => {
    const wrapper = await mountSuspended(BlogPostTable, {
      props: { posts: mockPosts }
    })
    expect(wrapper.text()).toContain('Test Post 1')
    expect(wrapper.text()).toContain('Test Post 2')
    expect(wrapper.text()).toContain('test-1')
    expect(wrapper.text()).toContain('test-2')
  })

  it('formats dates correctly', async () => {
    const wrapper = await mountSuspended(BlogPostTable, {
      props: { posts: [mockPosts[0]] }
    })
    expect(wrapper.text()).toContain('2023')
    expect(wrapper.text()).toContain('Jan')
  })

  it('emits edit when Edit button is clicked', async () => {
    const wrapper = await mountSuspended(BlogPostTable, {
      props: { posts: [mockPosts[0]] }
    })
    const editBtn = wrapper.findAll('button').find(b => b.text().includes('Edit'))
    if (editBtn) await editBtn.trigger('click')
    expect(wrapper.emitted('edit')).toEqual([[mockPosts[0]]])
  })

  it('emits delete when Delete button is clicked', async () => {
    const wrapper = await mountSuspended(BlogPostTable, {
      props: { posts: [mockPosts[0]] }
    })
    const deleteBtn = wrapper.findAll('button').find(b => b.text().includes('Delete'))
    if (deleteBtn) await deleteBtn.trigger('click')
    expect(wrapper.emitted('delete')).toEqual([[mockPosts[0]]])
  })
})
