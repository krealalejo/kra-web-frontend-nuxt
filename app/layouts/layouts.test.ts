import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'

vi.mock('~/composables/useGsapAnimations', () => ({
  useGsapNavAnimation: vi.fn(),
}))

const mockCookieValue = ref<string | null>(null)
mockNuxtImport('useCookie', () => {
  return vi.fn(() => mockCookieValue)
})

import DefaultLayout from './default.vue'
import AdminLayout from './admin.vue'

function expectStickyHeaderClasses(classes: string[]) {
  expect(classes).toContain('sticky')
  expect(classes).toContain('top-0')
  expect(classes).toContain('z-50')
  expect(classes).toContain('w-full')
}

describe('default layout', () => {
  it('renders a sticky header pinned to the top with stacking context', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p class="page-slot">Hello</p>' },
    })
    const header = wrapper.find('header')
    expect(header.exists()).toBe(true)
    expectStickyHeaderClasses(header.classes())
  })

  it('verifies the header has top-0 and w-full for correct sticking', async () => {
    const wrapper = await mountSuspended(DefaultLayout)
    const header = wrapper.find('header')
    expect(header.attributes('class')).toContain('top-0')
    expect(header.attributes('class')).toContain('w-full')
  })

  it('has computed position sticky', async () => {
    const wrapper = await mountSuspended(DefaultLayout)
    const header = wrapper.find('header')
    expect(header.attributes('class')).toContain('sticky')
  })

  it('renders the site brand link to home', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p>Hello</p>' },
    })
    const brand = wrapper.find('header a[href="/"]')
    expect(brand.exists()).toBe(true)
    expect(brand.text()).toContain('KRA')
  })

  it('renders primary navigation links', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p>Hello</p>' },
    })
    const nav = wrapper.find('header nav')
    expect(nav.exists()).toBe(true)
    const texts = nav.findAll('a').map(a => a.text())
    expect(texts).toEqual(['Home', 'Projects', 'Blog', 'Contact', 'CV'])
  })

  it('renders main slot content', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p class="page-slot">Hello</p>' },
    })
    expect(wrapper.find('main .page-slot').exists()).toBe(true)
    expect(wrapper.find('main .page-slot').text()).toBe('Hello')
  })

  it('toggles mobile menu when hamburger button is clicked', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p>Hello</p>' },
    })

    const button = wrapper.find('header button[aria-expanded]')

    expect(button.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.sm\\:hidden.overflow-hidden').exists()).toBe(false)

    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.sm\\:hidden.overflow-hidden').exists()).toBe(true)

    const mobileLinks = wrapper.findAll('.mobile-nav-link')
    expect(mobileLinks.length).toBe(5)
    expect(mobileLinks[0]!.classes()).toContain('text-center')
    expect(mobileLinks[0]!.classes()).toContain('rounded-xl')

    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.sm\\:hidden.overflow-hidden').exists()).toBe(false)
  })
})

describe('admin layout', () => {
  beforeEach(() => {
    mockCookieValue.value = null
  })

  it('opens mobile menu when hamburger button is clicked', async () => {
    mockCookieValue.value = 'admin@example.com'
    const wrapper = await mountSuspended(AdminLayout, {
      slots: { default: '<p>Content</p>' },
    })

    expect(wrapper.find('.mobile-overlay').exists()).toBe(false)
    const hamburger = wrapper.find('header button')
    await hamburger.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.mobile-overlay').exists()).toBe(true)
  })

  it('closes mobile menu when overlay is clicked', async () => {
    mockCookieValue.value = 'admin@example.com'
    const wrapper = await mountSuspended(AdminLayout, {
      slots: { default: '<p>Content</p>' },
    })

    const hamburger = wrapper.find('header button')
    await hamburger.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.mobile-overlay').exists()).toBe(true)

    await wrapper.find('.mobile-overlay').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.mobile-overlay').exists()).toBe(false)
  })

  it('shows header but hides sidebar when not authenticated', async () => {
    mockCookieValue.value = null
    const wrapper = await mountSuspended(AdminLayout, {
      slots: { default: '<p>Login content</p>' },
    })
    expect(wrapper.find('aside').exists()).toBe(false)
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('header').text()).toContain('KRA Admin')
    expect(wrapper.text()).toContain('Login content')
  })

  it('renders a sticky header pinned to the top when authenticated', async () => {
    mockCookieValue.value = 'admin@example.com'
    const wrapper = await mountSuspended(AdminLayout, {
      slots: { default: '<p>Admin content</p>' },
    })
    const header = wrapper.find('header')
    expect(header.exists()).toBe(true)
    expect(header.classes()).toContain('sticky')
    expect(header.classes()).toContain('top-0')
    expect(header.classes()).toContain('z-40')
  })

  it('renders admin title and logout control when authenticated', async () => {
    mockCookieValue.value = 'admin@example.com'
    const wrapper = await mountSuspended(AdminLayout, {
      slots: { default: '<p>Admin content</p>' },
    })
    expect(wrapper.text()).toContain('admin@example.com')
    const logout = wrapper
      .findAll('button')
      .find(b => b.text().includes('Logout'))
    expect(logout).toBeDefined()
    expect(logout!.text()).toContain('Logout')
  })

  it('renders sidebar when authenticated', async () => {
    mockCookieValue.value = 'admin@example.com'
    const wrapper = await mountSuspended(AdminLayout, {
      slots: { default: '<p>Admin content</p>' },
    })
    expect(wrapper.find('aside').exists()).toBe(true)
  })
})
