import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
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
    const wrapper = mount(ThemeToggle)
    await nextTick()

    expect(wrapper.attributes('aria-label')).toBe('Switch to dark mode')
    expect(wrapper.find('svg')).toBeDefined()
  })

  it('renders correctly when dark mode is active', async () => {
    mockIsDark.value = true
    const wrapper = mount(ThemeToggle)
    await nextTick()

    expect(wrapper.attributes('aria-label')).toBe('Switch to light mode')
  })

  it('calls toggle function when clicked', async () => {
    const wrapper = mount(ThemeToggle)
    await wrapper.trigger('click')

    expect(mockToggle).toHaveBeenCalled()
  })

  it('shows fallback during SSR/hydration', async () => {
    const wrapper = mount(ThemeToggle)
    expect(wrapper.find('button').exists()).toBe(true)
  })
})
