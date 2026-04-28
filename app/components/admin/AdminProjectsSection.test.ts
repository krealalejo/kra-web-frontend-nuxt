import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AdminProjectsSection from './AdminProjectsSection.vue'
import { flushPromises } from '@vue/test-utils'

const mockRepos = [
  { owner: 'owner1', name: 'repo1', fullName: 'owner1/repo1', description: 'Desc 1' },
  { owner: 'owner2', name: 'repo2', fullName: 'owner2/repo2', description: 'Desc 2' },
]

const mockMetadata = {
  role: 'Developer',
  year: '2024',
  kind: 'Backend',
  mainBranch: 'main',
  stack: ['vue', 'nuxt']
}

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('components/admin/AdminProjectsSection.vue', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockFetch.mockResolvedValue([])
  })

  it('renders loading state initially', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    const wrapper = await mountSuspended(AdminProjectsSection)
    expect(wrapper.text()).toContain('Loading repositories')
  })

  it('renders repos and metadata correctly', async () => {
    mockFetch
      .mockResolvedValueOnce(mockRepos)
      .mockResolvedValueOnce(mockMetadata)
      .mockRejectedValueOnce(new Error('Not found'))

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    expect(wrapper.text()).toContain('owner1/repo1')
    expect(wrapper.text()).toContain('owner2/repo2')
    expect(wrapper.text()).toContain('Metadata')
    expect(wrapper.text()).toContain('Add metadata')
  })

  it('opens add modal when Add metadata is clicked', async () => {
    mockFetch.mockResolvedValueOnce([mockRepos[1]])
    mockFetch.mockRejectedValueOnce(new Error('Not found'))

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    const addBtn = wrapper.find('button')
    await addBtn.trigger('click')

    expect(wrapper.text()).toContain('Add project metadata')
  })

  it('handles stack items correctly', async () => {
    mockFetch.mockResolvedValueOnce([mockRepos[1]])
    mockFetch.mockRejectedValueOnce(new Error('Not found'))

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    await wrapper.find('button').trigger('click')

    const input = wrapper.find('input[placeholder="Add technology…"]')
    await input.setValue('typescript')
    await input.trigger('keydown.enter')

    expect(wrapper.text()).toContain('typescript')

    const removeBtn = wrapper.find('span.chip button')
    await removeBtn.trigger('click')
    expect(wrapper.text()).not.toContain('typescript')
  })

  it('saves metadata successfully', async () => {
    mockFetch
      .mockResolvedValueOnce([mockRepos[1]])
      .mockRejectedValueOnce(new Error('Not found'))
      .mockResolvedValueOnce(mockMetadata)

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    await wrapper.find('button').trigger('click')
    await wrapper.find('button.btn-primary').trigger('click')
    await flushPromises()

    expect(wrapper.text()).not.toContain('Add project metadata')
  })

  it('handles save error', async () => {
    mockFetch
      .mockResolvedValueOnce([mockRepos[1]])
      .mockRejectedValueOnce(new Error('Not found'))
      .mockRejectedValueOnce(new Error('Save failed'))

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    await wrapper.find('button').trigger('click')
    await wrapper.find('button.btn-primary').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to save')
  })
})
