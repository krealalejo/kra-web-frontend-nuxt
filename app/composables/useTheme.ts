type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const theme = useState<Theme>('theme', () => 'system')

  function applyTheme(value: Theme) {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = value === 'dark' || (value === 'system' && prefersDark)
    root.classList.toggle('dark', shouldBeDark)
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

  function toggle() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function init() {
    if (import.meta.server) return
    const stored = localStorage.getItem('theme') as Theme | null
    const initial: Theme = stored === 'light' || stored === 'dark' ? stored : 'system'
    theme.value = initial
    applyTheme(initial)

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') applyTheme('system')
    })
  }

  const isDark = computed(() => {
    if (import.meta.server) return false
    return theme.value === 'dark' ||
      (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  return { theme, isDark, setTheme, toggle, init }
}
