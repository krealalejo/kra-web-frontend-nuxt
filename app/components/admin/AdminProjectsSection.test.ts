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

  it('opens edit modal with pre-filled data when edit button is clicked', async () => {
    mockFetch
      .mockResolvedValueOnce([mockRepos[0]])
      .mockResolvedValueOnce(mockMetadata)

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    const editBtn = wrapper.find('button[aria-label*="Edit metadata"]')
    await editBtn.trigger('click')

    expect(wrapper.text()).toContain('Edit project metadata')
    expect(wrapper.find('input[placeholder="Add technology…"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('vue')
    expect(wrapper.text()).toContain('nuxt')
  })

  it('closes modal when overlay background is clicked', async () => {
    mockFetch
      .mockResolvedValueOnce([mockRepos[1]])
      .mockRejectedValueOnce(new Error('Not found'))

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('Add project metadata')

    const allDivs = wrapper.findAll('div')
    const overlay = allDivs.find(d => {
      const style = d.attributes('style') ?? ''
      return style.includes('position:fixed') && style.includes('inset:0')
    })
    if (overlay) {
      await overlay.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).not.toContain('Add project metadata')
    } else {
      expect(wrapper.text()).toContain('Add project metadata')
    }
  })

  it('closes modal when Discard changes is clicked', async () => {
    mockFetch
      .mockResolvedValueOnce([mockRepos[1]])
      .mockRejectedValueOnce(new Error('Not found'))

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('Add project metadata')

    const discard = wrapper.findAll('button').find(b => b.text().includes('Discard'))
    await discard!.trigger('click')
    expect(wrapper.text()).not.toContain('Add project metadata')
  })

  it('shows empty repos message when no repos found', async () => {
    mockFetch.mockResolvedValueOnce([])

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    expect(wrapper.text()).toContain('No repositories found')
  })

  it('shows error when loading repos fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Load failed'))

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    expect(wrapper.text()).toContain('Could not load repositories')
  })

  it('does not add empty stack item', async () => {
    mockFetch.mockResolvedValueOnce([mockRepos[1]])
    mockFetch.mockRejectedValueOnce(new Error('Not found'))

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    await wrapper.find('button').trigger('click')

    const input = wrapper.find('input[placeholder="Add technology…"]')
    await input.setValue('  ')
    await input.trigger('keydown.enter')

    expect(wrapper.findAll('span.chip').length).toBe(0)
  })

  it('does not add duplicate stack item', async () => {
    mockFetch.mockResolvedValueOnce([mockRepos[1]])
    mockFetch.mockRejectedValueOnce(new Error('Not found'))

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    await wrapper.find('button').trigger('click')

    const input = wrapper.find('input[placeholder="Add technology…"]')
    await input.setValue('typescript')
    await input.trigger('keydown.enter')
    await input.setValue('typescript')
    await input.trigger('keydown.enter')

    expect(wrapper.findAll('span.chip').length).toBe(1)
  })

  it('accepts typed input in modal fields', async () => {
    mockFetch.mockResolvedValueOnce([mockRepos[1]])
    mockFetch.mockRejectedValueOnce(new Error('Not found'))

    const wrapper = await mountSuspended(AdminProjectsSection)
    await flushPromises()

    await wrapper.find('button').trigger('click')

    await wrapper.find('#modal-role').setValue('Lead Engineer')
    await wrapper.find('#modal-year').setValue('2024')
    await wrapper.find('#modal-branch').setValue('main')

    expect((wrapper.find('#modal-role').element as HTMLInputElement).value).toBe('Lead Engineer')
    expect((wrapper.find('#modal-year').element as HTMLInputElement).value).toBe('2024')
    expect((wrapper.find('#modal-branch').element as HTMLInputElement).value).toBe('main')
  })
})
