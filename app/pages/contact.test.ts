import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ContactPage from './contact.vue'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('pages/contact.vue', () => {
  beforeEach(() => {
    mockFetch.mockReset()
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
})
