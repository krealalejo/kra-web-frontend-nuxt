import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useToast } from './useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useToast().dismiss()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    useToast().dismiss()
  })

  it('show() sets toast value', () => {
    const { toast, show } = useToast()
    show('Hello', 'success')
    expect(toast.value).toEqual({ message: 'Hello', type: 'success' })
  })

  it('show() defaults to success type', () => {
    const { toast, show } = useToast()
    show('Hello')
    expect(toast.value?.type).toBe('success')
  })

  it('show() with error type sets error toast', () => {
    const { toast, show } = useToast()
    show('Something broke', 'error')
    expect(toast.value).toEqual({ message: 'Something broke', type: 'error' })
  })

  it('toast auto-dismisses after 3500ms', () => {
    const { toast, show } = useToast()
    show('Bye')
    expect(toast.value).not.toBeNull()
    vi.advanceTimersByTime(3499)
    expect(toast.value).not.toBeNull()
    vi.advanceTimersByTime(1)
    expect(toast.value).toBeNull()
  })

  it('toast does not dismiss before 3500ms', () => {
    const { toast, show } = useToast()
    show('Still here')
    vi.advanceTimersByTime(3499)
    expect(toast.value).not.toBeNull()
  })

  it('dismiss() clears toast immediately', () => {
    const { toast, show, dismiss } = useToast()
    show('Gone')
    expect(toast.value).not.toBeNull()
    dismiss()
    expect(toast.value).toBeNull()
  })

  it('new show() replaces existing toast and resets timer', () => {
    const { toast, show } = useToast()
    show('First')
    vi.advanceTimersByTime(2000)
    show('Second')
    expect(toast.value?.message).toBe('Second')
    vi.advanceTimersByTime(2000)
    expect(toast.value).not.toBeNull()
    vi.advanceTimersByTime(1500)
    expect(toast.value).toBeNull()
  })

  it('dismiss() on null toast is idempotent', () => {
    const { toast, dismiss } = useToast()
    expect(toast.value).toBeNull()
    expect(() => dismiss()).not.toThrow()
    expect(toast.value).toBeNull()
  })
})
