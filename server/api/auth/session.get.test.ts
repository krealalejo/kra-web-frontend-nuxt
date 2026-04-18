import { describe, it, expect, vi, beforeAll } from 'vitest'

// Stub Nuxt/H3 server-side auto-imports before module load
vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getCookie', vi.fn())

describe('session.get', () => {
  it('exists as a module', async () => {
    const mod = await import('./session.get')
    expect(mod.default).toBeDefined()
  })

  it('default export is a function', async () => {
    const mod = await import('./session.get')
    expect(typeof mod.default).toBe('function')
  })

  it('returns authenticated false when no cookie', async () => {
    const getCookieMock = vi.fn().mockReturnValue(undefined)
    vi.stubGlobal('getCookie', getCookieMock)

    const mod = await import('./session.get')
    const handler = mod.default as Function
    const result = handler({ node: { req: {}, res: {} } })
    expect(result).toEqual({ authenticated: false })
  })

  it('returns authenticated true when cookie present', async () => {
    const getCookieMock = vi.fn().mockReturnValue('some-session-token')
    vi.stubGlobal('getCookie', getCookieMock)

    // Re-import with new mock (module is cached, but handler closes over global getCookie)
    const mod = await import('./session.get')
    const handler = mod.default as Function
    const result = handler({ node: { req: {}, res: {} } })
    expect(result).toEqual({ authenticated: true })
  })
})
