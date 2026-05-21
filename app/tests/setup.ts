import { vi } from 'vitest'

// Must be set before any module loads — ScrollTrigger.js registers a setTimeout on import
// that calls requestAnimationFrame. happy-dom tears down window between test files, leaving
// the bare name undefined when that timer fires.
globalThis.requestAnimationFrame = globalThis.requestAnimationFrame
  ?? ((cb: FrameRequestCallback) => setTimeout(cb, 16) as unknown as number)
globalThis.cancelAnimationFrame = globalThis.cancelAnimationFrame
  ?? ((id: number) => clearTimeout(id))

vi.mock('gsap', () => {
  const gsapMock = {
    from: vi.fn().mockReturnThis(),
    to: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    killTweensOf: vi.fn(),
    registerPlugin: vi.fn(),
    timeline: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnThis(),
      to: vi.fn().mockReturnThis(),
      fromTo: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
    }),
    utils: {
      toArray: vi.fn((val) => {
        if (typeof val === 'string') return [val]
        return Array.isArray(val) ? val : [val]
      }),
    },
  }
  return {
    default: gsapMock,
    ...gsapMock,
  }
})

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: vi.fn(),
    refresh: vi.fn(),
    getAll: vi.fn().mockReturnValue([]),
    batch: vi.fn(),
  },
}))

vi.mock('gsap/ScrollToPlugin', () => ({
  ScrollToPlugin: {},
}))

vi.mock('~/composables/useGsap', async () => {
  const gsapModule = await import('gsap')
  const gsap = (gsapModule as any).default ?? gsapModule
  return {
    useGsap: vi.fn().mockResolvedValue({
      gsap,
      ScrollTrigger: {
        create: vi.fn(),
        refresh: vi.fn(),
        getAll: vi.fn().mockReturnValue([]),
        batch: vi.fn(),
      },
    }),
  }
})

vi.mock('#app', async (importOriginal) => {
  const actual = await importOriginal<typeof import('#app')>()
  return {
    ...actual,
    defineNuxtComponent: (cb: any) => cb,
  }
})

import { defineComponent, h } from 'vue'
const MockIcon = defineComponent({
  name: 'Icon',
  props: ['name'],
  render() {
    return h('span', { class: 'mock-icon', 'data-icon': this.name }, this.name)
  },
})

vi.mock('@nuxt/icon', () => ({
  default: MockIcon,
}))

const originalConsoleLog = console.log
const originalConsoleWarn = console.warn

const silentLogs = [
  '[Icon] failed to load icon',
  '[Vercel Speed Insights]',
  '[Vercel Web Analytics]',
  'GSAP target',
]

function shouldSilence(args: any[]) {
  const msg = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ')
  return silentLogs.some(log => msg.includes(log))
}

console.log = (...args) => {
  if (shouldSilence(args)) return
  originalConsoleLog(...args)
}

console.warn = (...args) => {
  if (shouldSilence(args)) return
  originalConsoleWarn(...args)
}

import { config } from '@vue/test-utils'
config.global.stubs = {
  ...config.global.stubs,
  Icon: MockIcon,
  NuxtIcon: MockIcon,
  NuxtLink: { template: '<a :href="to" v-bind="$attrs"><slot /></a>', props: ['to'] },
  NuxtLayout: { template: '<div><slot /></div>' },
  NuxtPage: { template: '<div />' },
  NuxtRouteAnnouncer: { template: '<div />' },
  ClientOnly: { template: '<div><slot /></div>' },
}

if (globalThis.window !== undefined) {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}
