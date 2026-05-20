import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'

const mockInit = vi.fn()
const mockIsDark = ref(false)
const useHeadSpy = vi.fn()

mockNuxtImport('useTheme', () =>
  vi.fn(() => ({ init: mockInit, isDark: mockIsDark, toggle: vi.fn() }))
)

// Wrap in closure so useHeadSpy is accessed at call time, not at hoist time
mockNuxtImport('useHead', () => (...args: any[]) => useHeadSpy(...args))

mockNuxtImport('useAsyncData', () => {
  return (_key: string, _factory: () => Promise<any>, _options?: any) => {
    return {
      data: ref(null),
      pending: ref(false),
      error: ref(null),
      status: ref('success'),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn()
    }
  }
})

import AppVue from './app.vue'

describe('app.vue', () => {
  beforeEach(() => {
    mockInit.mockClear()
    useHeadSpy.mockClear()
    mockIsDark.value = false
  })

  it('mounts and calls theme init on mount', async () => {
    mockInit.mockClear()
    const wrapper = await mountSuspended(AppVue)
    expect(wrapper.exists()).toBe(true)
    expect(mockInit).toHaveBeenCalled()
  })

  it('renders layout slot container', async () => {
    const wrapper = await mountSuspended(AppVue)
    expect(wrapper.html()).toBeTruthy()
  })

  describe('data-theme head attribute', () => {
    it('is a computed ref not a static string', async () => {
      await mountSuspended(AppVue)
      const headOpts = useHeadSpy.mock.calls[0]?.[0]
      const dataTheme = headOpts?.htmlAttrs?.['data-theme']
      expect(typeof dataTheme).not.toBe('string')
      expect(typeof dataTheme?.value).toBe('string')
    })

    it('resolves to light when isDark is false', async () => {
      mockIsDark.value = false
      await mountSuspended(AppVue)
      const headOpts = useHeadSpy.mock.calls[0]?.[0]
      const dataTheme = headOpts?.htmlAttrs?.['data-theme']
      expect(dataTheme?.value).toBe('light')
    })

    it('resolves to dark when isDark is true', async () => {
      mockIsDark.value = true
      await mountSuspended(AppVue)
      const headOpts = useHeadSpy.mock.calls[0]?.[0]
      const dataTheme = headOpts?.htmlAttrs?.['data-theme']
      expect(dataTheme?.value).toBe('dark')
    })

    it('updates reactively when isDark changes after mount', async () => {
      mockIsDark.value = false
      await mountSuspended(AppVue)
      const headOpts = useHeadSpy.mock.calls[0]?.[0]
      const dataTheme = headOpts?.htmlAttrs?.['data-theme']
      expect(dataTheme?.value).toBe('light')

      mockIsDark.value = true
      expect(dataTheme?.value).toBe('dark')
    })
  })
})
