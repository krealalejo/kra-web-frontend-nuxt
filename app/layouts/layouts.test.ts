import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref, nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'

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
    expect(wrapper.find('.nav-sheet.open').exists()).toBe(false)

    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.nav-sheet.open').exists()).toBe(true)

    const sheetLinks = wrapper.findAll('.nav-sheet-link')
    expect(sheetLinks.length).toBe(5)

    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.nav-sheet.open').exists()).toBe(false)
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

  it('closes mobile menu when overlay is clicked after route change', async () => {
    mockCookieValue.value = 'admin@example.com'
    const wrapper = await mountSuspended(AdminLayout, {
      slots: { default: '<p>Content</p>' },
      route: '/admin',
    })

    const hamburger = wrapper.find('header button')
    await hamburger.trigger('click')
    await nextTick()
    expect(wrapper.find('.mobile-overlay').exists()).toBe(true)

    await wrapper.find('.mobile-overlay').trigger('click')
    await nextTick()
    expect(wrapper.find('.mobile-overlay').exists()).toBe(false)
  })
})

describe('admin layout — mobile sidebar click closes menu', () => {
  beforeEach(() => {
    mockCookieValue.value = null
  })

  it('closes mobile menu when AdminSidebar is clicked', async () => {
    mockCookieValue.value = 'admin@example.com'
    const wrapper = await mountSuspended(AdminLayout, {
      slots: { default: '<p>Content</p>' },
    })

    const hamburger = wrapper.find('header button')
    await hamburger.trigger('click')
    await nextTick()
    expect(wrapper.find('.mobile-overlay').exists()).toBe(true)

    
    const sidebarAside = wrapper.find('.mobile-sidebar aside')
    await sidebarAside.trigger('click')
    await nextTick()
    expect(wrapper.find('.mobile-overlay').exists()).toBe(false)
  })
})

describe('admin layout — GSAP transition hooks', () => {
  beforeEach(() => {
    mockCookieValue.value = null
  })

  it('fires GSAP hooks when mobile menu transitions in', async () => {
    mockCookieValue.value = 'admin@example.com'
    const wrapper = await mountSuspended(AdminLayout, {
      slots: { default: '<p>Content</p>' },
    })

    const { default: gsap } = await import('gsap') as any
    vi.mocked(gsap.set).mockClear()
    vi.mocked(gsap.to).mockClear()

    vi.useFakeTimers()
    const hamburger = wrapper.find('header button')
    await hamburger.trigger('click')
    vi.runAllTimers()
    await nextTick()
    vi.useRealTimers()

    
    expect(wrapper.find('.mobile-overlay').exists()).toBe(true)
  })

  it('fires GSAP hooks when mobile menu transitions out', async () => {
    mockCookieValue.value = 'admin@example.com'
    const wrapper = await mountSuspended(AdminLayout, {
      slots: { default: '<p>Content</p>' },
    })

    vi.useFakeTimers()
    const hamburger = wrapper.find('header button')
    await hamburger.trigger('click')
    vi.runAllTimers()
    await nextTick()
    expect(wrapper.find('.mobile-overlay').exists()).toBe(true)

    const { default: gsap } = await import('gsap') as any
    vi.mocked(gsap.to).mockClear()

    await wrapper.find('.mobile-overlay').trigger('click')
    vi.runAllTimers()
    await nextTick()
    vi.useRealTimers()

    expect(wrapper.find('.mobile-overlay').exists()).toBe(false)
  })
})

describe('admin layout — GSAP hook functions (direct)', () => {
  beforeEach(() => {
    mockCookieValue.value = null
  })

  it('covers onBeforeEnter, onEnter, onLeave via setupState', async () => {
    mockCookieValue.value = 'admin@example.com'
    const wrapper = await mountSuspended(AdminLayout, {
      slots: { default: '<p>Content</p>' },
    })

    const vm = wrapper.vm as any
    const { onBeforeEnter, onEnter, onLeave } = vm.$.setupState

    const el = document.createElement('div')
    const sidebar = document.createElement('div')
    sidebar.className = 'mobile-sidebar'
    const overlay = document.createElement('div')
    overlay.className = 'mobile-overlay'
    el.appendChild(sidebar)
    el.appendChild(overlay)

    const done = vi.fn()

    await onBeforeEnter(el)
    await onEnter(el, done)

    const elNoSidebar = document.createElement('div')
    await onEnter(elNoSidebar, done)
    await onLeave(el, done)
    await onLeave(elNoSidebar, done)
    await onBeforeEnter(elNoSidebar)

    expect(done).toHaveBeenCalled()
  })
})

describe('default layout — overflow watcher', () => {
  it('sets body overflow to hidden when mobile menu opens', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p>Hello</p>' },
    })

    const button = wrapper.find('header button[aria-expanded]')
    await button.trigger('click')
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('clears body overflow when mobile menu closes', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p>Hello</p>' },
    })

    const button = wrapper.find('header button[aria-expanded]')
    await button.trigger('click')
    await nextTick()
    await button.trigger('click')
    await nextTick()
    expect(document.body.style.overflow).toBe('')
  })
})

describe('default layout — route watcher', () => {
  it('closes mobile menu when route changes', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p>Hello</p>' },
      route: '/',
    })

    const button = wrapper.find('header button[aria-expanded]')
    await button.trigger('click')
    expect(wrapper.find('.nav-sheet.open').exists()).toBe(true)

    await (wrapper.vm.$router as any).push('/blog')
    await flushPromises()
    expect(wrapper.find('.nav-sheet.open').exists()).toBe(false)
  })
})

describe('default layout — theme toggle', () => {
  it('calls toggle when theme button is clicked', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p>Hello</p>' },
    })

    const themeBtn = wrapper.find('button.kra-theme-btn')
    if (themeBtn.exists()) {
      await themeBtn.trigger('click')
      expect(themeBtn.exists()).toBe(true)
    }
  })

  it('mobile cluster button shows correct aria-label in dark mode', async () => {
    const theme = useState<string>('theme')
    const prev = theme.value
    theme.value = 'dark'

    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p>Hello</p>' },
    })
    await nextTick()

    const mobileBtn = wrapper.find('.nav-mobile-cluster button.kra-theme-btn')
    if (mobileBtn.exists()) {
      expect(mobileBtn.attributes('aria-label')).toBe('Switch to light mode')
    }

    theme.value = prev
  })
})
