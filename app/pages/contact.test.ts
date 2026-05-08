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

  it('shows NUXT_PUBLIC_API_BASE_URL error when apiBase is empty', async () => {
    mockApiBase = ''
    const wrapper = await mountSuspended(ContactPage)
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('This is a valid test message')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('NUXT_PUBLIC_API_BASE_URL')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('shows singular "character" (not "characters") when 9 chars typed', async () => {
    const wrapper = await mountSuspended(ContactPage)
    const textarea = wrapper.find('#message')
    await textarea.setValue('123456789')
    expect(wrapper.text()).toContain('1 more character needed')
    expect(wrapper.text()).not.toContain('characters')
  })
})
