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
    // Default mock behavior to prevent infinite loops or errors in setup
    mockFetch.mockResolvedValue([])
  })

  it('renders loading state initially', async () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // Never resolves
    const wrapper = await mountSuspended(AdminProjectsSection)
    expect(wrapper.text()).toContain('Loading repositories')
  })

  it('renders repos and metadata correctly', async () => {
    mockFetch
      .mockResolvedValueOnce(mockRepos) // First call for repos
      .mockResolvedValueOnce(mockMetadata) // Second call for metadata repo1
      .mockRejectedValueOnce(new Error('Not found')) // Third call for metadata repo2

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    expect(wrapper.text()).toContain('owner1/repo1')
    expect(wrapper.text()).toContain('owner2/repo2')
    expect(wrapper.text()).toContain('Metadata') // Shows for repo1
    expect(wrapper.text()).toContain('Add metadata') // Shows for repo2
  })

  it('opens add modal when Add metadata is clicked', async () => {
    mockFetch.mockResolvedValueOnce([mockRepos[1]]) // Only repo2
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

    await wrapper.find('button').trigger('click') // Open modal

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
      .mockRejectedValueOnce(new Error('Not found')) // Initial metadata check
      .mockResolvedValueOnce(mockMetadata) // Save call

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    await wrapper.find('button').trigger('click') // Open modal
    await wrapper.find('button.btn-primary').trigger('click') // Click save
    await flushPromises()

    expect(wrapper.text()).not.toContain('Add project metadata') // Modal closed
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
