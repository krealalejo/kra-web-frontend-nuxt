import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LoginPage from './login.vue'

describe('pages/admin/login.vue', () => {
  beforeEach(() => {
    vi.stubGlobal('location', { origin: 'http://localhost:3000', href: '' })
  })

  it('renders without crashing', async () => {
    const wrapper = await mountSuspended(LoginPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the Sign In button', async () => {
    const wrapper = await mountSuspended(LoginPage)
    const btn = wrapper.find('button')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Sign In')
  })

  it('renders no error alert when there is no query error', async () => {
    const wrapper = await mountSuspended(LoginPage, { route: '/admin/login' })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('shows access_denied error message', async () => {
    const wrapper = await mountSuspended(LoginPage, {
      route: '/admin/login?error=access_denied',
    })
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.find('[role="alert"]').text()).toContain('cancelled')
  })

  it('shows token_exchange_failed error message', async () => {
    const wrapper = await mountSuspended(LoginPage, {
      route: '/admin/login?error=token_exchange_failed',
    })
    expect(wrapper.find('[role="alert"]').text()).toContain('complete login')
  })

  it('shows token_fetch_failed error message', async () => {
    const wrapper = await mountSuspended(LoginPage, {
      route: '/admin/login?error=token_fetch_failed',
    })
    expect(wrapper.find('[role="alert"]').text()).toContain('authentication service')
  })

  it('shows missing_code error message', async () => {
    const wrapper = await mountSuspended(LoginPage, {
      route: '/admin/login?error=missing_code',
    })
    expect(wrapper.find('[role="alert"]').text()).toContain('Invalid login response')
  })

  it('shows a generic fallback message for unknown error codes', async () => {
    const wrapper = await mountSuspended(LoginPage, {
      route: '/admin/login?error=unknown_code',
    })
    expect(wrapper.find('[role="alert"]').text()).toContain('Login failed')
  })

  it('clicking Sign In redirects to Cognito authorize URL', async () => {
    const wrapper = await mountSuspended(LoginPage, { route: '/admin/login' })
    await wrapper.find('button').trigger('click')
    expect((window.location as Location & { href: string }).href).toContain('oauth2/authorize')
  })
})
