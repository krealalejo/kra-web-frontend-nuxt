import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

const { MockKonami, mockUnload } = vi.hoisted(() => {
  const mockUnload = vi.fn()
  const MockKonami = vi.fn(function (cb: () => void) {
    return { unload: mockUnload, callback: cb }
  })
  return { MockKonami, mockUnload }
})

vi.mock('konami', () => ({ default: MockKonami }))

import AppKonamiListener from './AppKonamiListener.vue'

describe('components/AppKonamiListener.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('instantiates Konami on mount', async () => {
    mount(AppKonamiListener)
    expect(MockKonami).toHaveBeenCalledTimes(1)
    expect(typeof MockKonami.mock.calls[0][0]).toBe('function')
  })

  it('toggles isRickRolled state when Konami callback fires', async () => {
    mount(AppKonamiListener)
    const cb = MockKonami.mock.calls[0][0] as () => void
    const isRickRolled = useState<boolean>('isRickRolled')
    expect(isRickRolled.value).toBe(false)
    cb()
    expect(isRickRolled.value).toBe(true)
    cb()
    expect(isRickRolled.value).toBe(false)
  })

  it('calls unload on beforeUnmount when instance exists', async () => {
    const wrapper = mount(AppKonamiListener)
    wrapper.unmount()
    expect(mockUnload).toHaveBeenCalledTimes(1)
  })

  it('does not throw on unmount when instance is null', async () => {
    MockKonami.mockImplementationOnce(function () { throw new Error('init failed') })
    const wrapper = mount(AppKonamiListener)
    expect(() => wrapper.unmount()).not.toThrow()
    expect(mockUnload).not.toHaveBeenCalled()
  })
})
