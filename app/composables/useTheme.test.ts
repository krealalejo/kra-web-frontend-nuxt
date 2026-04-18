import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

vi.stubGlobal('useState', <T>(_key: string, init: () => T) => ref(init()))

function mockMatchMedia(prefersDark: boolean, captureListener?: (fn: () => void) => void) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: prefersDark,
      addEventListener: vi.fn((event: string, fn: () => void) => {
        if (event === 'change' && captureListener) captureListener(fn)
      }),
    })),
  )
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    mockMatchMedia(false)
  })

  describe('setTheme', () => {
    it('adds dark class when theme is set to dark', async () => {
      const { useTheme } = await import('./useTheme')
      const { setTheme } = useTheme()
      setTheme('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('removes dark class when theme is set to light', async () => {
      document.documentElement.classList.add('dark')
      const { useTheme } = await import('./useTheme')
      const { setTheme } = useTheme()
      setTheme('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('persists dark theme to localStorage', async () => {
      const { useTheme } = await import('./useTheme')
      const { setTheme } = useTheme()
      setTheme('dark')
      expect(localStorage.getItem('theme')).toBe('dark')
    })

    it('persists light theme to localStorage', async () => {
      const { useTheme } = await import('./useTheme')
      const { setTheme } = useTheme()
      setTheme('light')
      expect(localStorage.getItem('theme')).toBe('light')
    })

    it('removes theme from localStorage when set to system', async () => {
      localStorage.setItem('theme', 'dark')
      const { useTheme } = await import('./useTheme')
      const { setTheme } = useTheme()
      setTheme('system')
      expect(localStorage.getItem('theme')).toBeNull()
    })

    it('applies dark class in system mode when OS prefers dark', async () => {
      mockMatchMedia(true)
      const { useTheme } = await import('./useTheme')
      const { setTheme } = useTheme()
      setTheme('system')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('removes dark class in system mode when OS prefers light', async () => {
      mockMatchMedia(false)
      const { useTheme } = await import('./useTheme')
      const { setTheme } = useTheme()
      setTheme('system')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('toggle', () => {
    it('switches from dark to light', async () => {
      const { useTheme } = await import('./useTheme')
      const { theme, toggle } = useTheme()
      theme.value = 'dark'
      toggle()
      expect(theme.value).toBe('light')
    })

    it('switches from light to dark', async () => {
      const { useTheme } = await import('./useTheme')
      const { theme, toggle } = useTheme()
      theme.value = 'light'
      toggle()
      expect(theme.value).toBe('dark')
    })
  })

  describe('init', () => {
    it('restores dark theme from localStorage', async () => {
      localStorage.setItem('theme', 'dark')
      const { useTheme } = await import('./useTheme')
      const { theme, init } = useTheme()
      init()
      expect(theme.value).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('restores light theme from localStorage', async () => {
      localStorage.setItem('theme', 'light')
      const { useTheme } = await import('./useTheme')
      const { theme, init } = useTheme()
      init()
      expect(theme.value).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('defaults to system when no stored theme', async () => {
      const { useTheme } = await import('./useTheme')
      const { theme, init } = useTheme()
      init()
      expect(theme.value).toBe('system')
    })

    it('registers a media query change listener', async () => {
      const addEventListenerMock = vi.fn()
      vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: addEventListenerMock })))
      const { useTheme } = await import('./useTheme')
      const { init } = useTheme()
      init()
      expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('re-applies system theme when OS preference changes and theme is system', async () => {
      let changeListener: (() => void) | undefined
      mockMatchMedia(true, (fn) => { changeListener = fn })
      const { useTheme } = await import('./useTheme')
      const { theme, init } = useTheme()
      theme.value = 'system'
      init()
      changeListener?.()
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('skips re-apply when OS preference changes and theme is not system', async () => {
      localStorage.setItem('theme', 'dark')
      let changeListener: (() => void) | undefined
      mockMatchMedia(false, (fn) => { changeListener = fn })
      const { useTheme } = await import('./useTheme')
      const { init } = useTheme()
      init()
      document.documentElement.classList.remove('dark')
      changeListener?.()
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('isDark', () => {
    it('returns true when theme is dark', async () => {
      const { useTheme } = await import('./useTheme')
      const { theme, isDark } = useTheme()
      theme.value = 'dark'
      expect(isDark.value).toBe(true)
    })

    it('returns false when theme is light', async () => {
      const { useTheme } = await import('./useTheme')
      const { theme, isDark } = useTheme()
      theme.value = 'light'
      expect(isDark.value).toBe(false)
    })

    it('returns true in system mode when OS prefers dark', async () => {
      mockMatchMedia(true)
      const { useTheme } = await import('./useTheme')
      const { theme, isDark } = useTheme()
      theme.value = 'system'
      expect(isDark.value).toBe(true)
    })

    it('returns false in system mode when OS prefers light', async () => {
      mockMatchMedia(false)
      const { useTheme } = await import('./useTheme')
      const { theme, isDark } = useTheme()
      theme.value = 'system'
      expect(isDark.value).toBe(false)
    })
  })
})
