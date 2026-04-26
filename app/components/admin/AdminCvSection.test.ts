import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('AdminCvSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue([])
  })

  it('renders Experience tab initially', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    expect(wrapper.text()).toContain('Experience')
  })

  it('renders Education tab when clicked', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')
    expect(wrapper.text()).toContain('Education')
  })

  it('renders Skills tab when clicked', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const skillsTab = wrapper.findAll('button').find(b => b.text().includes('Skills'))
    await skillsTab!.trigger('click')
    expect(wrapper.text()).toContain('Skills')
  })

  it('opens add experience modal', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const addBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add'))
    await addBtn!.trigger('click')
    expect(wrapper.text()).toContain('Add Experience')
  })

  it('opens add education modal', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')
    const addBtn = wrapper.findAll('button').filter(b => b.text().toLowerCase().includes('add'))[1]
    await addBtn!.trigger('click')
    expect(wrapper.text()).toContain('Add Education')
  })
})
