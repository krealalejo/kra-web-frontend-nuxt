import { describe, it, expect, vi, beforeEach } from 'vitest'

// Global setup (app/tests/setup.ts) mocks '~/composables/useGsap'. Pull the real
// implementation so this file exercises the actual module, not the stub.
async function loadReal() {
  return await vi.importActual<typeof import('./useGsap')>('./useGsap')
}

describe('useGsap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves gsap + ScrollTrigger and registers the plugin', async () => {
    const { useGsap } = await loadReal()
    const gsapModule = await import('gsap')
    const gsap = (gsapModule as any).default

    const result = await useGsap()

    expect(result.gsap).toBe(gsap)
    expect(result.ScrollTrigger).toBeDefined()
    expect(gsap.registerPlugin).toHaveBeenCalled()
  })

  it('useGsapBase resolves gsap only', async () => {
    const { useGsapBase } = await loadReal()
    const gsapModule = await import('gsap')
    const gsap = (gsapModule as any).default

    const result = await useGsapBase()

    expect(result.gsap).toBe(gsap)
    expect(result).not.toHaveProperty('ScrollTrigger')
  })
})
