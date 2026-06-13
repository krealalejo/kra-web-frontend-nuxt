import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import ActivitySection from './ActivitySection.vue'

const mockFetchCards = vi.fn()
const mockUpdateCard = vi.fn()
const mockCards = ref([
  { type: 'SHIPPING', title: 'Ship title', description: 'Ship desc' },
  { type: 'READING', title: 'Read title', description: 'Read desc', url: 'https://book.example' },
  { type: 'PLAYING', tags: ['tag1', 'tag2'] }
])
let mockStoreError: string | null = null
const mockShowToast = vi.fn()

mockNuxtImport('useToast', () => {
  return () => ({
    toast: { value: null },
    show: mockShowToast,
    dismiss: vi.fn(),
  })
})

mockNuxtImport('useActivityStore', () => {
  return () => ({
    cards: mockCards.value,
    fetchCards: mockFetchCards,
    updateCard: mockUpdateCard,
    loading: false,
    error: mockStoreError
  })
})

describe('ActivitySection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateCard.mockResolvedValue({})
    mockFetchCards.mockResolvedValue({})
    mockStoreError = null
  })

  it('renders all three activity cards', async () => {
    const wrapper = mount(ActivitySection)
    expect(wrapper.text()).toContain('SHIPPING')
    expect(wrapper.text()).toContain('READING')
    expect(wrapper.text()).toContain('PLAYING')
  })

  it('isolates saving state per card', async () => {
    const wrapper = mount(ActivitySection)

    let resolveSave: (val: any) => void
    const savePromise = new Promise((resolve) => { resolveSave = resolve })
    mockUpdateCard.mockReturnValue(savePromise)

    const shipButton = wrapper.findAll('button').find(b => b.text().includes('Save'))
    const readButton = wrapper.findAll('button').filter(b => b.text().includes('Save'))[1]

    await shipButton!.trigger('click')

    expect(shipButton!.text()).toContain('Saving…')
    expect(shipButton!.attributes('disabled')).toBeDefined()

    expect(readButton!.text()).toBe('Save')
    expect(readButton!.attributes('disabled')).toBeUndefined()

    resolveSave!({})
    await nextTick()
    await nextTick()

    expect(shipButton!.text()).toBe('Save')
  })

  it('isolates error state per card', async () => {
    const wrapper = mount(ActivitySection)

    mockUpdateCard.mockRejectedValue(new Error('Failed to save SHIPPING'))

    const shipButton = wrapper.findAll('button').find(b => b.text().includes('Save'))
    await shipButton!.trigger('click')
    await flushPromises()

    expect(mockShowToast).toHaveBeenCalledWith('Failed to save SHIPPING', 'error')

    const readingCard = wrapper.findAll('.rounded-2xl')[1]
    expect(readingCard!.text()).not.toContain('Failed to save SHIPPING')
  })

  it('saves READING card', async () => {
    const wrapper = mount(ActivitySection)
    await flushPromises()
    const saveButtons = wrapper.findAll('button').filter(b => b.text().includes('Save'))
    const readingBtn = saveButtons[1]!
    await readingBtn.trigger('click')
    expect(mockUpdateCard).toHaveBeenCalledWith('READING', expect.objectContaining({ title: 'Read title', description: 'Read desc', url: 'https://book.example' }))
  })

  it('loads and edits the READING url field', async () => {
    const wrapper = mount(ActivitySection)
    await flushPromises()
    expect((wrapper.find('#reading-url').element as HTMLInputElement).value).toBe('https://book.example')
    await wrapper.find('#reading-url').setValue('https://new.example/book')
    const saveButtons = wrapper.findAll('button').filter(b => b.text().includes('Save'))
    await saveButtons[1]!.trigger('click')
    expect(mockUpdateCard).toHaveBeenCalledWith('READING', expect.objectContaining({ url: 'https://new.example/book' }))
  })

  it('saves PLAYING card', async () => {
    const wrapper = mount(ActivitySection)
    const saveButtons = wrapper.findAll('button').filter(b => b.text().includes('Save'))
    const playingBtn = saveButtons[2]!
    await playingBtn.trigger('click')
    expect(mockUpdateCard).toHaveBeenCalledWith('PLAYING', expect.objectContaining({ tags: expect.any(Array) }))
  })

  it('adds tag via Enter key and renders it', async () => {
    const wrapper = mount(ActivitySection)
    const tagInput = wrapper.find('input[placeholder="Add tag… (Enter to add)"]')
    await tagInput.setValue('NewTag')
    await tagInput.trigger('keydown.enter')
    expect(wrapper.text()).toContain('NewTag')
  })

  it('does not add duplicate tag', async () => {
    const wrapper = mount(ActivitySection)
    const tagInput = wrapper.find('input[placeholder="Add tag… (Enter to add)"]')
    await tagInput.setValue('tag1')
    await tagInput.trigger('keydown.enter')
    const occurrences = wrapper.text().split('tag1').length - 1
    expect(occurrences).toBe(1)
  })

  it('does not add empty tag', async () => {
    const wrapper = mount(ActivitySection)
    await flushPromises()
    const chipsBefore = wrapper.findAll('.chip').length
    const tagInput = wrapper.find('input[placeholder="Add tag… (Enter to add)"]')
    await tagInput.setValue('   ')
    await tagInput.trigger('keydown.enter')
    expect(wrapper.findAll('.chip').length).toBe(chipsBefore)
  })

  it('removes tag via ✕ button', async () => {
    const wrapper = mount(ActivitySection)
    await flushPromises()
    expect(wrapper.text()).toContain('tag1')
    const removeBtn = wrapper.find('.chip button')
    await removeBtn.trigger('click')
    expect(wrapper.text()).not.toContain('tag1')
  })

  it('shows error message when fetchCards throws', async () => {
    mockFetchCards.mockRejectedValue(new Error('Fetch failed'))
    const wrapper = mount(ActivitySection)
    await flushPromises()
    expect(mockShowToast).toHaveBeenCalledWith('Failed to load activity cards', 'error')
  })

  it('updates shipping title and description via input setValue', async () => {
    const wrapper = mount(ActivitySection)
    await flushPromises()
    await wrapper.find('#shipping-title').setValue('My Ship Title')
    await wrapper.find('#shipping-description').setValue('My Ship Desc')
    expect((wrapper.find('#shipping-title').element as HTMLInputElement).value).toBe('My Ship Title')
    expect((wrapper.find('#shipping-description').element as HTMLTextAreaElement).value).toBe('My Ship Desc')
  })

  it('updates reading title and description via input setValue', async () => {
    const wrapper = mount(ActivitySection)
    await flushPromises()
    await wrapper.find('#reading-title').setValue('Clean Code')
    await wrapper.find('#reading-description').setValue('Robert C. Martin')
    expect((wrapper.find('#reading-title').element as HTMLInputElement).value).toBe('Clean Code')
    expect((wrapper.find('#reading-description').element as HTMLTextAreaElement).value).toBe('Robert C. Martin')
  })

  it('shows READING error when READING save fails', async () => {
    mockUpdateCard.mockRejectedValue(new Error('Reading save error'))
    const wrapper = mount(ActivitySection)
    const saveButtons = wrapper.findAll('button').filter(b => b.text().includes('Save'))
    await saveButtons[1]!.trigger('click')
    await flushPromises()
    expect(mockShowToast).toHaveBeenCalledWith('Reading save error', 'error')
  })

  it('shows PLAYING error when PLAYING save fails', async () => {
    mockUpdateCard.mockRejectedValue(new Error('Playing save error'))
    const wrapper = mount(ActivitySection)
    const saveButtons = wrapper.findAll('button').filter(b => b.text().includes('Save'))
    await saveButtons[2]!.trigger('click')
    await flushPromises()
    expect(mockShowToast).toHaveBeenCalledWith('Playing save error', 'error')
  })

  it('shows "Save failed" when rejection is not an Error instance', async () => {
    mockUpdateCard.mockRejectedValue('string rejection')
    const wrapper = mount(ActivitySection)
    const saveButton = wrapper.findAll('button').find(b => b.text().includes('Save'))
    await saveButton!.trigger('click')
    await flushPromises()
    expect(mockShowToast).toHaveBeenCalledWith('Save failed', 'error')
  })

  it('uses store.error message when fetchCards throws and store.error is set', async () => {
    mockStoreError = 'Store reported an error'
    mockFetchCards.mockRejectedValue(new Error('Fetch failed'))
    const wrapper = mount(ActivitySection)
    await flushPromises()
    expect(mockShowToast).toHaveBeenCalledWith('Store reported an error', 'error')
  })

  it('has correct layout classes for bottom alignment', async () => {
    const wrapper = mount(ActivitySection)
    const cards = wrapper.findAll('.rounded-2xl')

    cards.forEach(card => {
      const style = card.attributes('style') || ''
      expect(style).toContain('display: flex')
      expect(style).toContain('flex-direction: column')

      const button = card.findAll('button').find(b => b.text().includes('Save'))
      expect(button).toBeDefined()
      const btnStyle = button!.attributes('style') || ''
      expect(btnStyle).toContain('margin-top: auto')
    })
  })
})
