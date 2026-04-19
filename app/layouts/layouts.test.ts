import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

vi.mock('~/composables/useGsapAnimations', () => ({
  useGsapNavAnimation: vi.fn(),
}))

import DefaultLayout from './default.vue'
import AdminLayout from './admin.vue'

function expectStickyHeaderClasses(classes: string[]) {
  expect(classes).toContain('sticky')
  expect(classes).toContain('top-0')
  expect(classes).toContain('z-40')
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

  it('renders the site brand link to home', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p>Hello</p>' },
    })
    const brand = wrapper.find('header a[href="/"]')
    expect(brand.exists()).toBe(true)
    expect(brand.text()).toBe('KRA')
  })

  it('renders primary navigation links', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p>Hello</p>' },
    })
    const nav = wrapper.find('header nav')
    expect(nav.exists()).toBe(true)
    const texts = nav.findAll('a').map(a => a.text())
    expect(texts).toEqual(['Home', 'Blog', 'Contact', 'CV'])
  })

  it('renders main slot content', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p class="page-slot">Hello</p>' },
    })
    expect(wrapper.find('main .page-slot').exists()).toBe(true)
    expect(wrapper.find('main .page-slot').text()).toBe('Hello')
  })
})

describe('admin layout', () => {
  it('renders a sticky header pinned to the top with stacking context', async () => {
    const wrapper = await mountSuspended(AdminLayout, {
      slots: { default: '<p>Admin content</p>' },
    })
    const header = wrapper.find('header')
    expect(header.exists()).toBe(true)
    expectStickyHeaderClasses(header.classes())
  })

  it('renders admin title and logout control', async () => {
    const wrapper = await mountSuspended(AdminLayout, {
      slots: { default: '<p>Admin content</p>' },
    })
    expect(wrapper.find('header').text()).toContain('KRA Admin')
    const logout = wrapper
      .findAll('header button')
      .find(b => b.text().trim() === 'Logout')
    expect(logout).toBeDefined()
    expect(logout!.text()).toBe('Logout')
  })
})
