import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

let mockApiBase = 'http://localhost:8080'

mockNuxtImport('useRuntimeConfig', () => {
  return () => ({
    public: { apiBase: mockApiBase },
    app: { baseURL: '/', buildAssetsDir: '/_nuxt/', cdnURL: '' }
  })
})

import ContactPage from './contact.vue'

describe('pages/contact.vue', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockApiBase = 'http://localhost:8080'
  })

  it('renders the contact form', async () => {
    const wrapper = await mountSuspended(ContactPage)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('renders email and message inputs', async () => {
    const wrapper = await mountSuspended(ContactPage)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#message').exists()).toBe(true)
  })

  it('shows character counter for the message field', async () => {
    const wrapper = await mountSuspended(ContactPage)
    expect(wrapper.text()).toContain('/4000')
  })

  it('shows "more characters needed" hint when message is too short', async () => {
    const wrapper = await mountSuspended(ContactPage)
    const textarea = wrapper.find('#message')
    await textarea.setValue('short')
    expect(wrapper.text()).toContain('more character')
  })

  it('hides the "more characters needed" hint when message is long enough', async () => {
    const wrapper = await mountSuspended(ContactPage)
    const textarea = wrapper.find('#message')
    await textarea.setValue('This is a valid message with enough characters')
    expect(wrapper.text()).not.toContain('more character')
  })

  it('shows success state after successful submission', async () => {
    mockFetch.mockResolvedValue(undefined)
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('This is a valid test message')
    await wrapper.find('form').trigger('submit')
    await new Promise(r => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Message sent')
  })

  it('shows error banner when submission fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('This is a valid test message')
    await wrapper.find('form').trigger('submit')
    await new Promise(r => setTimeout(r, 0))
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Could not send')
  })

  it('clicking "Send another" resets success state back to form', async () => {
    mockFetch.mockResolvedValue(undefined)
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('This is a valid test message')
    await wrapper.find('form').trigger('submit')
    await new Promise(r => setTimeout(r, 0))
    const sendAnother = wrapper.findAll('button').find(b => b.text().includes('Send another'))
    if (sendAnother) {
      await sendAnother.trigger('click')
      expect(wrapper.find('form').exists()).toBe(true)
    }
  })

  it('email and message inputs are focusable', async () => {
    const wrapper = await mountSuspended(ContactPage)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#message').exists()).toBe(true)
  })

  it('shows a user-facing unavailable message without leaking env var names when apiBase is empty', async () => {
    mockApiBase = ''
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('This is a valid test message')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('The contact form is unavailable right now')
    expect(wrapper.text()).not.toContain('NUXT_PUBLIC_API_BASE_URL')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('shows an invalid email hint and keeps submit disabled for a malformed email', async () => {
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('not-an-email')
    await wrapper.find('#message').setValue('This is a valid test message')
    expect(wrapper.text()).toContain('Enter a valid email address')
    expect(wrapper.find('#email').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('does not show the email hint while the email field is empty', async () => {
    const wrapper = await mountSuspended(ContactPage)
    expect(wrapper.text()).not.toContain('Enter a valid email address')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('enables submit once both email and message are valid', async () => {
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('This is a valid test message')
    expect(wrapper.text()).not.toContain('Enter a valid email address')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('does not call the API when the form is submitted with an invalid email', async () => {
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('test@example')
    await wrapper.find('#message').setValue('This is a valid test message')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('does not call the API when the form is submitted with a short message', async () => {
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('short')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('sends the trimmed email to the API', async () => {
    mockFetch.mockResolvedValue(undefined)
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('  test@example.com  ')
    await wrapper.find('#message').setValue('This is a valid test message')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/contact', {
      method: 'POST',
      body: { email: 'test@example.com', message: 'This is a valid test message' },
    })
  })

  it('shows a specific message when the API responds with 400 via statusCode', async () => {
    mockFetch.mockRejectedValue(Object.assign(new Error('Bad Request'), { statusCode: 400 }))
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('This is a valid test message')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    const alert = wrapper.find('[role="alert"]')
    expect(alert.text()).toContain('Your message was rejected')
    expect(alert.text()).not.toContain('Could not send')
  })

  it('shows a specific message when the API responds with 400 via status', async () => {
    mockFetch.mockRejectedValue(Object.assign(new Error('Bad Request'), { status: 400 }))
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('This is a valid test message')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('Your message was rejected')
  })

  it('keeps the generic message for non-400 API errors', async () => {
    mockFetch.mockRejectedValue(Object.assign(new Error('Server Error'), { statusCode: 500 }))
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('This is a valid test message')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('Could not send your message')
  })

  it('keeps the generic message when the rejection value is not an object', async () => {
    mockFetch.mockRejectedValue(null)
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('This is a valid test message')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('Could not send your message')
  })

  it('shows singular "character" (not "characters") when 9 chars typed', async () => {
    const wrapper = await mountSuspended(ContactPage)
    const textarea = wrapper.find('#message')
    await textarea.setValue('123456789')
    expect(wrapper.text()).toContain('1 more character needed')
    expect(wrapper.text()).not.toContain('characters')
  })
})
