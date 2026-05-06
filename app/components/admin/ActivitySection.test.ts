import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import ActivitySection from './ActivitySection.vue'

const mockFetchCards = vi.fn()
const mockUpdateCard = vi.fn()
const mockCards = ref([
  { type: 'SHIPPING', title: 'Ship title', description: 'Ship desc' },
  { type: 'READING', title: 'Read title', description: 'Read desc' },
  { type: 'PLAYING', tags: ['tag1', 'tag2'] }
])

mockNuxtImport('useActivityStore', () => {
  return () => ({
    cards: mockCards.value,
    fetchCards: mockFetchCards,
    updateCard: mockUpdateCard,
    loading: false,
    error: null
  })
})

describe('ActivitySection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateCard.mockResolvedValue({})
    mockFetchCards.mockResolvedValue({})
  })

  it('renders all three activity cards', async () => {
    const wrapper = await mountSuspended(ActivitySection)
    expect(wrapper.text()).toContain('SHIPPING')
    expect(wrapper.text()).toContain('READING')
    expect(wrapper.text()).toContain('PLAYING')
  })

  it('isolates saving state per card', async () => {
    const wrapper = await mountSuspended(ActivitySection)

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
    const wrapper = await mountSuspended(ActivitySection)

    mockUpdateCard.mockRejectedValue(new Error('Failed to save SHIPPING'))

    const shipButton = wrapper.findAll('button').find(b => b.text().includes('Save'))
    await shipButton!.trigger('click')

    expect(wrapper.text()).toContain('Failed to save SHIPPING')

    const readingCard = wrapper.findAll('.rounded-2xl')[1]
    expect(readingCard!.text()).not.toContain('Failed to save SHIPPING')
  })

  it('saves READING card', async () => {
    const wrapper = await mountSuspended(ActivitySection)
    const saveButtons = wrapper.findAll('button').filter(b => b.text().includes('Save'))
    const readingBtn = saveButtons[1]!
    await readingBtn.trigger('click')
    expect(mockUpdateCard).toHaveBeenCalledWith('READING', expect.objectContaining({ title: 'Read title', description: 'Read desc' }))
  })

  it('saves PLAYING card', async () => {
    const wrapper = await mountSuspended(ActivitySection)
    const saveButtons = wrapper.findAll('button').filter(b => b.text().includes('Save'))
    const playingBtn = saveButtons[2]!
    await playingBtn.trigger('click')
    expect(mockUpdateCard).toHaveBeenCalledWith('PLAYING', expect.objectContaining({ tags: expect.any(Array) }))
  })

  it('adds tag via Enter key and renders it', async () => {
    const wrapper = await mountSuspended(ActivitySection)
    const tagInput = wrapper.find('input[placeholder="Add tag… (Enter to add)"]')
    await tagInput.setValue('NewTag')
    await tagInput.trigger('keydown.enter')
    expect(wrapper.text()).toContain('NewTag')
  })

  it('does not add duplicate tag', async () => {
    const wrapper = await mountSuspended(ActivitySection)
    const tagInput = wrapper.find('input[placeholder="Add tag… (Enter to add)"]')
    await tagInput.setValue('tag1')
    await tagInput.trigger('keydown.enter')
    const occurrences = wrapper.text().split('tag1').length - 1
    expect(occurrences).toBe(1)
  })

  it('does not add empty tag', async () => {
    const wrapper = await mountSuspended(ActivitySection)
    const chipsBefore = wrapper.findAll('.chip').length
    const tagInput = wrapper.find('input[placeholder="Add tag… (Enter to add)"]')
    await tagInput.setValue('   ')
    await tagInput.trigger('keydown.enter')
    expect(wrapper.findAll('.chip').length).toBe(chipsBefore)
  })

  it('removes tag via ✕ button', async () => {
    const wrapper = await mountSuspended(ActivitySection)
    expect(wrapper.text()).toContain('tag1')
    const removeBtn = wrapper.find('.chip button')
    await removeBtn.trigger('click')
    expect(wrapper.text()).not.toContain('tag1')
  })

  it('shows error message when fetchCards throws', async () => {
    mockFetchCards.mockRejectedValue(new Error('Fetch failed'))
    const wrapper = await mountSuspended(ActivitySection)
    await flushPromises()
    expect(wrapper.text()).toContain('Failed to load activity cards')
  })

  it('updates shipping title and description via input setValue', async () => {
    const wrapper = await mountSuspended(ActivitySection)
    await flushPromises()
    await wrapper.find('#shipping-title').setValue('My Ship Title')
    await wrapper.find('#shipping-description').setValue('My Ship Desc')
    expect((wrapper.find('#shipping-title').element as HTMLInputElement).value).toBe('My Ship Title')
    expect((wrapper.find('#shipping-description').element as HTMLTextAreaElement).value).toBe('My Ship Desc')
  })

  it('updates reading title and description via input setValue', async () => {
    const wrapper = await mountSuspended(ActivitySection)
    await flushPromises()
    await wrapper.find('#reading-title').setValue('Clean Code')
    await wrapper.find('#reading-description').setValue('Robert C. Martin')
    expect((wrapper.find('#reading-title').element as HTMLInputElement).value).toBe('Clean Code')
    expect((wrapper.find('#reading-description').element as HTMLTextAreaElement).value).toBe('Robert C. Martin')
  })

  it('has correct layout classes for bottom alignment', async () => {
    const wrapper = await mountSuspended(ActivitySection)
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
