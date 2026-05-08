import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useActivityStore } from './activity'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:8080'
    }
  })
}))

describe('stores/activity.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
  })

  it('initializes with empty state', () => {
    const store = useActivityStore()
    expect(store.cards).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })

  it('fetchCards success', async () => {
    const mockCards = [{ type: 'SHIPPING', title: 'Test', description: 'Desc' }]
    mockFetch.mockResolvedValue(mockCards)

    const store = useActivityStore()
    await store.fetchCards()

    expect(store.loading).toBe(false)
    expect(store.cards).toEqual(mockCards)
    expect(store.error).toBe(null)
  })

  it('fetchCards failure', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'))

    const store = useActivityStore()
    await store.fetchCards()

    expect(store.loading).toBe(false)
    expect(store.cards).toEqual([])
    expect(store.error).toBe('API Error')
  })

  it('fetchCards failure with string error', async () => {
    mockFetch.mockRejectedValue('Fatal Error')

    const store = useActivityStore()
    await store.fetchCards()

    expect(store.error).toBe('Failed to load activity cards')
  })

  it('updateCard success', async () => {
    const initialCards = [{ type: 'SHIPPING', title: 'Old', description: 'Old' }]
    const updatedCard = { type: 'SHIPPING', title: 'New', description: 'New' }

    const store = useActivityStore()
    store.cards = initialCards
    mockFetch.mockResolvedValue(updatedCard)

    const result = await store.updateCard('SHIPPING', { title: 'New', description: 'New' })

    expect(result).toEqual(updatedCard)
    expect(store.cards[0]).toEqual(updatedCard)
    expect(store.loading).toBe(false)
  })

  it('updateCard failure', async () => {
    mockFetch.mockRejectedValue(new Error('Update failed'))

    const store = useActivityStore()
    await expect(store.updateCard('SHIPPING', { title: 'New' })).rejects.toThrow('Update failed')

    expect(store.loading).toBe(false)
    expect(store.error).toBe('Update failed')
  })

  it('updateCard failure with generic error', async () => {
    mockFetch.mockRejectedValue('Unknown')

    const store = useActivityStore()
    await expect(store.updateCard('SHIPPING', { title: 'New' })).rejects.toBe('Unknown')

    expect(store.error).toBe('Failed to update activity card')
  })

  it('updateCard when type not in cards leaves cards unchanged', async () => {
    const updatedCard = { type: 'READING', title: 'New', description: 'New' }
    mockFetch.mockResolvedValue(updatedCard)

    const store = useActivityStore()
    store.cards = [{ type: 'SHIPPING', title: 'Old', description: 'Old' }]

    const result = await store.updateCard('READING', { title: 'New' })

    expect(result).toEqual(updatedCard)
    expect(store.cards).toEqual([{ type: 'SHIPPING', title: 'Old', description: 'Old' }])
    expect(store.loading).toBe(false)
  })
})
