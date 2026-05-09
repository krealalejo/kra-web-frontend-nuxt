import { describe, it, expect, vi, beforeAll } from 'vitest'

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
    const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64')
    const getCookieMock = vi.fn().mockReturnValue(`header.${payload}.sig`)
    vi.stubGlobal('getCookie', getCookieMock)

    const mod = await import('./session.get')
    const handler = mod.default as Function
    const result = handler({ node: { req: {}, res: {} } })
    expect(result).toEqual({ authenticated: true })
  })
})
