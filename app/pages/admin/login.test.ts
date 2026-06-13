import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount, flushPromises } from '@vue/test-utils'
import LoginPage from './login.vue'

const { mockNavigateTo } = vi.hoisted(() => ({
  mockNavigateTo: vi.fn(),
}))

mockNuxtImport('navigateTo', () => mockNavigateTo)

const mockFetch = vi.fn()

describe('pages/admin/login.vue', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockNavigateTo.mockReset()
    vi.stubGlobal('$fetch', mockFetch)
  })

  it('renders without crashing', () => {
    const wrapper = mount(LoginPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the Sign In button', () => {
    const wrapper = mount(LoginPage)
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Sign In')
  })

  it('renders email and password inputs', () => {
    const wrapper = mount(LoginPage)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('renders no error alert on initial render', () => {
    const wrapper = mount(LoginPage)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('shows 401 error message for wrong credentials', async () => {
    mockFetch.mockRejectedValueOnce({ statusCode: 401 })
    const wrapper = mount(LoginPage)
    await wrapper.find('input[type="email"]').setValue('a@b.com')
    await wrapper.find('input[type="password"]').setValue('wrong')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.find('[role="alert"]').text()).toContain('Incorrect email or password')
  })

  it('shows 403 error message for password reset required', async () => {
    mockFetch.mockRejectedValueOnce({ statusCode: 403 })
    const wrapper = mount(LoginPage)
    await wrapper.find('input[type="email"]').setValue('a@b.com')
    await wrapper.find('input[type="password"]').setValue('pass')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('Password reset required')
  })

  it('shows 503 error message for service unavailable', async () => {
    mockFetch.mockRejectedValueOnce({ statusCode: 503 })
    const wrapper = mount(LoginPage)
    await wrapper.find('input[type="email"]').setValue('a@b.com')
    await wrapper.find('input[type="password"]').setValue('pass')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('Authentication service unavailable')
  })

  it('shows generic fallback error for unknown status codes', async () => {
    mockFetch.mockRejectedValueOnce({ statusCode: 500, data: { message: 'Unexpected error' } })
    const wrapper = mount(LoginPage)
    await wrapper.find('input[type="email"]').setValue('a@b.com')
    await wrapper.find('input[type="password"]').setValue('pass')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('Unexpected error')
  })

  it('navigates to /admin/quality on successful login', async () => {
    mockFetch.mockResolvedValueOnce({})
    const wrapper = mount(LoginPage)
    await wrapper.find('input[type="email"]').setValue('a@b.com')
    await wrapper.find('input[type="password"]').setValue('correctpass')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(mockNavigateTo).toHaveBeenCalledWith('/admin/quality')
  })

  it('does not submit when email or password is empty', async () => {
    const wrapper = mount(LoginPage)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('toggles password visibility when eye button clicked', async () => {
    const wrapper = mount(LoginPage)
    const passwordInput = wrapper.find('input#password')
    expect(passwordInput.attributes('type')).toBe('password')
    await wrapper.find('button.login-eye').trigger('click')
    expect(passwordInput.attributes('type')).toBe('text')
    await wrapper.find('button.login-eye').trigger('click')
    expect(passwordInput.attributes('type')).toBe('password')
  })
})
