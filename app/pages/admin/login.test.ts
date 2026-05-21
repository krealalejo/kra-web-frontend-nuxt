import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import LoginPage from './login.vue'

const { mockQuery } = vi.hoisted(() => ({
  mockQuery: {} as Record<string, string | undefined>
}))

mockNuxtImport('useRoute', () => () => ({
  path: '/admin/login',
  query: mockQuery,
  params: {},
  matched: [],
  hash: '',
  meta: {}
}))

describe('pages/admin/login.vue', () => {
  beforeEach(() => {
    vi.stubGlobal('location', { origin: 'http://localhost:3000', href: '' })
    Object.keys(mockQuery).forEach(k => delete mockQuery[k])
  })

  it('renders without crashing', () => {
    const wrapper = mount(LoginPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the Sign In button', () => {
    const wrapper = mount(LoginPage)
    const btn = wrapper.find('button')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Sign In')
  })

  it('renders no error alert when there is no query error', () => {
    const wrapper = mount(LoginPage)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('shows access_denied error message', () => {
    mockQuery.error = 'access_denied'
    const wrapper = mount(LoginPage)
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.find('[role="alert"]').text()).toContain('cancelled')
  })

  it('shows token_exchange_failed error message', () => {
    mockQuery.error = 'token_exchange_failed'
    const wrapper = mount(LoginPage)
    expect(wrapper.find('[role="alert"]').text()).toContain('complete login')
  })

  it('shows token_fetch_failed error message', () => {
    mockQuery.error = 'token_fetch_failed'
    const wrapper = mount(LoginPage)
    expect(wrapper.find('[role="alert"]').text()).toContain('authentication service')
  })

  it('shows missing_code error message', () => {
    mockQuery.error = 'missing_code'
    const wrapper = mount(LoginPage)
    expect(wrapper.find('[role="alert"]').text()).toContain('Invalid login response')
  })

  it('shows a generic fallback message for unknown error codes', () => {
    mockQuery.error = 'unknown_code'
    const wrapper = mount(LoginPage)
    expect(wrapper.find('[role="alert"]').text()).toContain('Login failed')
  })

  it('clicking Sign In redirects to Cognito authorize URL', async () => {
    const wrapper = mount(LoginPage)
    await wrapper.find('button').trigger('click')
    expect((window.location as Location & { href: string }).href).toContain('oauth2/authorize')
  })
})
