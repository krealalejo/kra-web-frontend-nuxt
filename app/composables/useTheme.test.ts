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

function withViewTransitionMock() {
  const startViewTransition = vi.fn((update: () => void) => {
    update()
    return { ready: Promise.resolve() }
  })
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    writable: true,
    value: startViewTransition,
  })
  return startViewTransition
}

function removeViewTransitionMock() {
  Reflect.deleteProperty(document, 'startViewTransition')
}

function stubElementAnimate() {
  const animate = vi.fn().mockReturnValue({ cancel: vi.fn() } as unknown as Animation)
  Object.defineProperty(document.documentElement, 'animate', {
    configurable: true,
    writable: true,
    value: animate,
  })
  return animate
}

function removeElementAnimateStub() {
  Reflect.deleteProperty(document.documentElement, 'animate')
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    mockMatchMedia(false)
    removeViewTransitionMock()
    removeElementAnimateStub()
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
      await toggle()
      expect(theme.value).toBe('light')
    })

    it('switches from light to dark', async () => {
      const { useTheme } = await import('./useTheme')
      const { theme, toggle } = useTheme()
      theme.value = 'light'
      await toggle()
      expect(theme.value).toBe('dark')
    })

    it('runs clip-path animation from click when view transitions are available', async () => {
      withViewTransitionMock()
      const animateSpy = stubElementAnimate()

      const { useTheme } = await import('./useTheme')
      const { theme, toggle } = useTheme()
      theme.value = 'light'
      await toggle({ clientX: 80, clientY: 120 } as MouseEvent)

      expect(theme.value).toBe('dark')
      expect(animateSpy).toHaveBeenCalled()
      const [keyframes, options] = animateSpy.mock.calls[0] as [
        { clipPath: string[] },
        KeyframeAnimationOptions,
      ]
      expect(keyframes.clipPath[0]).toBe('circle(0px at 80px 120px)')
      expect(keyframes.clipPath[1]).toMatch(/^circle\([\d.]+px at 80px 120px\)$/)
      expect(options.duration).toBe(450)
      expect(options.easing).toBe('ease-in-out')
      expect(options.pseudoElement).toBe('::view-transition-new(root)')

      removeElementAnimateStub()
      removeViewTransitionMock()
    })

    it('uses viewport center for animation when toggle has no event', async () => {
      withViewTransitionMock()
      const animateSpy = stubElementAnimate()

      const { useTheme } = await import('./useTheme')
      const { theme, toggle } = useTheme()
      theme.value = 'dark'
      await toggle()

      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const [keyframes] = animateSpy.mock.calls[0] as [{ clipPath: string[] }]
      expect(keyframes.clipPath[0]).toBe(`circle(0px at ${cx}px ${cy}px)`)

      removeElementAnimateStub()
      removeViewTransitionMock()
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
