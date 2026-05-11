import { describe, it, expect, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'

const mockInit = vi.fn()
mockNuxtImport('useTheme', () =>
  vi.fn(() => ({ init: mockInit, isDark: ref(false), toggle: vi.fn() }))
)

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
})
