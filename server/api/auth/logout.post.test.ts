import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('deleteCookie', vi.fn())
vi.stubGlobal('sendRedirect', vi.fn().mockResolvedValue(undefined))
vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({
  public: {
    cognitoDomain: 'https://auth.example.com',
    cognitoClientId: 'client123',
    cognitoLogoutUri: 'http://localhost:3000',
  },
}))

describe('auth/logout.post', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('deleteCookie', vi.fn())
    vi.stubGlobal('sendRedirect', vi.fn().mockResolvedValue(undefined))
    vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({
      public: {
        cognitoDomain: 'https://auth.example.com',
        cognitoClientId: 'client123',
        cognitoLogoutUri: 'http://localhost:3000',
      },
    }))
  })

  it('clears both session cookies', async () => {
    const mockDeleteCookie = vi.fn()
    vi.stubGlobal('deleteCookie', mockDeleteCookie)

    const mod = await import('./logout.post')
    const handler = mod.default as Function
    await handler({})

    expect(mockDeleteCookie).toHaveBeenCalledTimes(2)
    expect(mockDeleteCookie).toHaveBeenCalledWith(expect.anything(), 'kra_session', expect.any(Object))
    expect(mockDeleteCookie).toHaveBeenCalledWith(expect.anything(), 'kra_user', expect.any(Object))
  })

  it('redirects to Cognito logout URL', async () => {
    const mockSendRedirect = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('sendRedirect', mockSendRedirect)

    const mod = await import('./logout.post')
    const handler = mod.default as Function
    await handler({})

    expect(mockSendRedirect).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('/logout?client_id='),
      302,
    )
  })
})
