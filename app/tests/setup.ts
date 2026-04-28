import { vi } from 'vitest'

vi.mock('gsap', () => {
  const gsapMock = {
    from: vi.fn().mockReturnThis(),
    to: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    registerPlugin: vi.fn(),
    timeline: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnThis(),
      to: vi.fn().mockReturnThis(),
      fromTo: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
    }),
    utils: {
      toArray: vi.fn((val) => (typeof val === 'string' ? [val] : (Array.isArray(val) ? val : [val]))),
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
const originalConsoleError = console.error

const silentLogs = [
  '<Suspense> is an experimental feature',
  '[Icon] failed to load icon',
  'Both esbuild and oxc options were set',
]

function shouldSilence(args: any[]) {
  const msg = args.join(' ')
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

console.error = (...args) => {
  if (shouldSilence(args)) return
  originalConsoleError(...args)
}

import { config } from '@vue/test-utils'
config.global.stubs = {
  ...config.global.stubs,
  Icon: MockIcon,
  NuxtIcon: MockIcon,
  ClientOnly: { template: '<div><slot /></div>' },
}
