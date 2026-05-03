type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const theme = useState<Theme>('theme', () => 'system')

  function applyTheme(value: Theme) {
    const root = document.documentElement
    const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = value === 'dark' || (value === 'system' && prefersDark)
    root.classList.toggle('dark', shouldBeDark)
    root.dataset.theme = shouldBeDark ? 'dark' : 'light'
  }

  function setTheme(value: Theme) {
    theme.value = value
    if (value === 'system') {
      localStorage.removeItem('theme')
    } else {
      localStorage.setItem('theme', value)
    }
    applyTheme(value)
  }

  async function toggle(event?: MouseEvent) {
    const nextTheme = theme.value === 'dark' ? 'light' : 'dark'

    if (!document.startViewTransition) {
      setTheme(nextTheme)
      return
    }

    const x = event?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? window.innerHeight / 2
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme)
    })

    await transition.ready

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 450,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  }

  function init() {
    if (import.meta.server) return
    const stored = localStorage.getItem('theme') as Theme | null
    const initial: Theme = stored === 'light' || stored === 'dark' ? stored : 'system'
    theme.value = initial
    applyTheme(initial)

    globalThis.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') applyTheme('system')
    })
  }

  const isDark = computed(() => {
    if (import.meta.server) return false
    return theme.value === 'dark' ||
      (theme.value === 'system' && globalThis.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  return { theme, isDark, setTheme, toggle, init }
}
