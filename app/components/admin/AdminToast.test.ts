import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import AdminToast from './AdminToast.vue'

const mockToast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const mockDismiss = vi.fn()

mockNuxtImport('useToast', () => {
  return () => ({
    toast: mockToast,
    show: vi.fn(),
    dismiss: mockDismiss,
  })
})

const stubs = {
  Icon: true,
  Transition: { template: '<slot />' },
}

describe('AdminToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToast.value = null
  })

  it('renders nothing when toast is null', () => {
    const wrapper = mount(AdminToast, { global: { stubs } })
    expect(wrapper.find('div').exists()).toBe(false)
  })

  it('renders toast message when set', () => {
    mockToast.value = { message: 'Changes saved', type: 'success' }
    const wrapper = mount(AdminToast, { global: { stubs } })
    expect(wrapper.text()).toContain('Changes saved')
  })

  it('applies green color style for success type', () => {
    mockToast.value = { message: 'Saved', type: 'success' }
    const wrapper = mount(AdminToast, { global: { stubs } })
    expect(wrapper.find('div').attributes('style')).toContain('#22c55e')
  })

  it('applies red color style for error type', () => {
    mockToast.value = { message: 'Something failed', type: 'error' }
    const wrapper = mount(AdminToast, { global: { stubs } })
    expect(wrapper.find('div').attributes('style')).toContain('#dc2626')
  })

  it('calls dismiss when close button is clicked', async () => {
    mockToast.value = { message: 'Test', type: 'success' }
    const wrapper = mount(AdminToast, { global: { stubs } })
    await wrapper.find('button[type="button"]').trigger('click')
    expect(mockDismiss).toHaveBeenCalled()
  })
})
