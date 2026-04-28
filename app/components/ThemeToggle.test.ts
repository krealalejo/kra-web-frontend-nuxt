import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ThemeToggle from './ThemeToggle.vue'

const mockToggle = vi.fn()
const mockIsDark = ref(false)

vi.mock('../composables/useTheme', () => ({
  useTheme: () => ({
    isDark: mockIsDark,
    toggle: mockToggle
  })
}))

describe('components/ThemeToggle.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsDark.value = false
  })

  it('renders correctly when light mode is active', async () => {
    const wrapper = await mountSuspended(ThemeToggle)
    await nextTick()

    expect(wrapper.attributes('aria-label')).toBe('Switch to dark mode')
    expect(wrapper.find('svg')).toBeDefined()
  })

  it('renders correctly when dark mode is active', async () => {
    mockIsDark.value = true
    const wrapper = await mountSuspended(ThemeToggle)
    await nextTick()

    expect(wrapper.attributes('aria-label')).toBe('Switch to light mode')
  })

  it('calls toggle function when clicked', async () => {
    const wrapper = await mountSuspended(ThemeToggle)
    await wrapper.trigger('click')

    expect(mockToggle).toHaveBeenCalled()
  })

  it('shows fallback during SSR/hydration', async () => {
    const wrapper = await mountSuspended(ThemeToggle)
    expect(wrapper.find('button').exists()).toBe(true)
  })
})
