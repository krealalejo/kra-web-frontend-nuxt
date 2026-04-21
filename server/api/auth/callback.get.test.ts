import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('getQuery', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn())
vi.stubGlobal('sendRedirect', vi.fn().mockResolvedValue(undefined))
vi.stubGlobal('setCookie', vi.fn())
vi.stubGlobal('fetch', vi.fn())

const baseConfig = {
  public: {
    cognitoDomain: 'https://auth.example.com',
    cognitoRedirectUri: 'http://localhost:3000/api/auth/callback',
    cognitoClientId: 'client123',
  },
  cognitoClientSecret: 'secret123',
}

describe('auth/callback.get', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue(baseConfig))
    vi.stubGlobal('sendRedirect', vi.fn().mockResolvedValue(undefined))
    vi.stubGlobal('setCookie', vi.fn())
  })

  it('redirects to login when Cognito returns an error param', async () => {
    const mockSendRedirect = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('getQuery', vi.fn().mockReturnValue({ error: 'access_denied' }))
    vi.stubGlobal('sendRedirect', mockSendRedirect)

    const mod = await import('./callback.get')
    const handler = mod.default as Function
    await handler({})

    expect(mockSendRedirect).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('/admin/login?error='),
      302,
    )
  })

  it('redirects to login with missing_code when no code and no error', async () => {
    const mockSendRedirect = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('getQuery', vi.fn().mockReturnValue({}))
    vi.stubGlobal('sendRedirect', mockSendRedirect)

    const mod = await import('./callback.get')
    const handler = mod.default as Function
    await handler({})

    expect(mockSendRedirect).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('missing_code'),
      302,
    )
  })

  it('redirects to login when fetch throws', async () => {
    const mockSendRedirect = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('getQuery', vi.fn().mockReturnValue({ code: 'valid-code' }))
    vi.stubGlobal('sendRedirect', mockSendRedirect)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const mod = await import('./callback.get')
    const handler = mod.default as Function
    await handler({})

    expect(mockSendRedirect).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('token_fetch_failed'),
      302,
    )
  })

  it('redirects to login when token response has an error field', async () => {
    const mockSendRedirect = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('getQuery', vi.fn().mockReturnValue({ code: 'valid-code' }))
    vi.stubGlobal('sendRedirect', mockSendRedirect)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: vi.fn().mockResolvedValue({ error: 'invalid_grant', error_description: 'Code expired' }),
    }))

    const mod = await import('./callback.get')
    const handler = mod.default as Function
    await handler({})

    expect(mockSendRedirect).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('invalid_grant'),
      302,
    )
  })

  it('redirects to login when token response has no id_token', async () => {
    const mockSendRedirect = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('getQuery', vi.fn().mockReturnValue({ code: 'valid-code' }))
    vi.stubGlobal('sendRedirect', mockSendRedirect)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: vi.fn().mockResolvedValue({ access_token: 'at', token_type: 'Bearer' }),
    }))

    const mod = await import('./callback.get')
    const handler = mod.default as Function
    await handler({})

    expect(mockSendRedirect).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('token_exchange_failed'),
      302,
    )
  })

  it('sets session cookie and redirects to /admin on success with email claim', async () => {
    const mockSendRedirect = vi.fn().mockResolvedValue(undefined)
    const mockSetCookie = vi.fn()

    const payload = Buffer.from(JSON.stringify({ email: 'admin@example.com', sub: 'user123' })).toString('base64')
    const fakeIdToken = `header.${payload}.signature`

    vi.stubGlobal('getQuery', vi.fn().mockReturnValue({ code: 'valid-code' }))
    vi.stubGlobal('sendRedirect', mockSendRedirect)
    vi.stubGlobal('setCookie', mockSetCookie)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: vi.fn().mockResolvedValue({ id_token: fakeIdToken, access_token: 'at' }),
    }))

    const mod = await import('./callback.get')
    const handler = mod.default as Function
    await handler({})

    expect(mockSetCookie).toHaveBeenCalledWith(expect.anything(), 'kra_session', fakeIdToken, expect.any(Object))
    expect(mockSetCookie).toHaveBeenCalledWith(expect.anything(), 'kra_user', 'admin@example.com', expect.any(Object))
    expect(mockSendRedirect).toHaveBeenCalledWith(expect.anything(), '/admin', 302)
  })

  it('falls back to cognito:username when email claim is absent', async () => {
    const mockSetCookie = vi.fn()
    const payload = Buffer.from(JSON.stringify({ 'cognito:username': 'myuser', sub: 'user123' })).toString('base64')
    const fakeIdToken = `header.${payload}.signature`

    vi.stubGlobal('getQuery', vi.fn().mockReturnValue({ code: 'valid-code' }))
    vi.stubGlobal('sendRedirect', vi.fn().mockResolvedValue(undefined))
    vi.stubGlobal('setCookie', mockSetCookie)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: vi.fn().mockResolvedValue({ id_token: fakeIdToken, access_token: 'at' }),
    }))

    const mod = await import('./callback.get')
    const handler = mod.default as Function
    await handler({})

    expect(mockSetCookie).toHaveBeenCalledWith(expect.anything(), 'kra_user', 'myuser', expect.any(Object))
  })

  it('falls back to admin when JWT payload cannot be decoded', async () => {
    const mockSetCookie = vi.fn()
    const fakeIdToken = 'not.valid.jwt'

    vi.stubGlobal('getQuery', vi.fn().mockReturnValue({ code: 'valid-code' }))
    vi.stubGlobal('sendRedirect', vi.fn().mockResolvedValue(undefined))
    vi.stubGlobal('setCookie', mockSetCookie)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: vi.fn().mockResolvedValue({ id_token: fakeIdToken, access_token: 'at' }),
    }))

    const mod = await import('./callback.get')
    const handler = mod.default as Function
    await handler({})

    expect(mockSetCookie).toHaveBeenCalledWith(expect.anything(), 'kra_user', 'admin', expect.any(Object))
  })

  it('redirects to login when fetch response is not ok and not JSON', async () => {
    const mockSendRedirect = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('getQuery', vi.fn().mockReturnValue({ code: 'valid-code' }))
    vi.stubGlobal('sendRedirect', mockSendRedirect)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      headers: { get: () => 'text/html' },
      json: vi.fn(),
    }))

    const mod = await import('./callback.get')
    const handler = mod.default as Function
    await handler({})

    expect(mockSendRedirect).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('token_fetch_failed'),
      302,
    )
  })
})
