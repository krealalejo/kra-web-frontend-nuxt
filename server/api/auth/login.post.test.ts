import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import {
  NotAuthorizedException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider'

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn())
vi.stubGlobal('setCookie', vi.fn())
vi.stubGlobal('createError', vi.fn().mockImplementation((opts) => Object.assign(new Error(opts.message), opts)))
vi.stubGlobal('getRequestIP', vi.fn().mockReturnValue('127.0.0.1'))

const mockSend = vi.fn()
vi.mock('@aws-sdk/client-cognito-identity-provider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@aws-sdk/client-cognito-identity-provider')>()
  return {
    ...actual,
    CognitoIdentityProviderClient: vi.fn(function(this: Record<string, unknown>) { this.send = mockSend }),
    InitiateAuthCommand: vi.fn(),
  }
})

const baseConfig = {
  public: {
    cognitoDomain: 'https://kra-637423522796.auth.eu-west-1.amazoncognito.com',
    cognitoClientId: 'client123',
  },
  cognitoClientSecret: 'secret123',
}

function makeIdToken(payload: Record<string, unknown>) {
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64')
  return `header.${b64}.signature`
}

let resetRateLimit: () => void
beforeAll(async () => {
  const mod = await import('./login.post')
  resetRateLimit = mod._resetRateLimitForTest
})

describe('auth/login.post', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRateLimit()
    vi.stubGlobal('getRequestIP', vi.fn().mockReturnValue('127.0.0.1'))
    vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue(baseConfig))
    vi.stubGlobal('setCookie', vi.fn())
    vi.stubGlobal('createError', vi.fn().mockImplementation((opts) => Object.assign(new Error(opts.message), opts)))
  })

  it('throws 429 after exceeding rate limit', async () => {
    vi.stubGlobal('getRequestIP', vi.fn().mockReturnValue('10.0.0.1'))
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ email: 'u@e.com', password: 'p' }))
    mockSend.mockRejectedValue(new NotAuthorizedException({ message: 'bad', $metadata: {} }))

    const mod = await import('./login.post')
    const handler = mod.default as Function

    for (let i = 0; i < 15; i++) {
      await handler({}).catch(() => {})
    }
    await expect(handler({})).rejects.toMatchObject({ statusCode: 429 })
  })

  it('throws 400 when password exceeds 256 chars', async () => {
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ email: 'u@e.com', password: 'a'.repeat(257) }))

    const mod = await import('./login.post')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when body is missing email', async () => {
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ password: 'pass' }))

    const mod = await import('./login.post')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when body is missing password', async () => {
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ email: 'user@example.com' }))

    const mod = await import('./login.post')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 401 for NotAuthorizedException', async () => {
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ email: 'user@example.com', password: 'wrongpass' }))
    mockSend.mockRejectedValue(new NotAuthorizedException({ message: 'Incorrect username or password.', $metadata: {} }))

    const mod = await import('./login.post')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 401 for UserNotFoundException', async () => {
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ email: 'unknown@example.com', password: 'pass' }))
    mockSend.mockRejectedValue(new UserNotFoundException({ message: 'User not found.', $metadata: {} }))

    const mod = await import('./login.post')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 403 when ChallengeName is present', async () => {
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ email: 'user@example.com', password: 'pass' }))
    mockSend.mockResolvedValue({ ChallengeName: 'NEW_PASSWORD_REQUIRED' })

    const mod = await import('./login.post')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toMatchObject({ statusCode: 403 })
  })

  it('rethrows unexpected SDK errors', async () => {
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ email: 'user@example.com', password: 'pass' }))
    mockSend.mockRejectedValue(new Error('InternalServerError'))

    const mod = await import('./login.post')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toThrow('InternalServerError')
  })

  it('throws 500 when AuthenticationResult has no AccessToken', async () => {
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ email: 'user@example.com', password: 'pass' }))
    mockSend.mockResolvedValue({ AuthenticationResult: {} })

    const mod = await import('./login.post')
    const handler = mod.default as Function

    await expect(handler({})).rejects.toMatchObject({ statusCode: 500 })
  })

  it('sets kra_session cookie and returns { ok: true } on success', async () => {
    const mockSetCookie = vi.fn()
    const idToken = makeIdToken({ email: 'user@example.com' })
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ email: 'user@example.com', password: 'pass' }))
    vi.stubGlobal('setCookie', mockSetCookie)
    mockSend.mockResolvedValue({ AuthenticationResult: { AccessToken: 'access-token', IdToken: idToken } })

    const mod = await import('./login.post')
    const handler = mod.default as Function
    const result = await handler({})

    expect(result).toEqual({ ok: true })
    expect(mockSetCookie).toHaveBeenCalledWith(expect.anything(), 'kra_session', 'access-token', expect.any(Object))
  })

  it('sets kra_user to email from IdToken on success', async () => {
    const mockSetCookie = vi.fn()
    const idToken = makeIdToken({ email: 'user@example.com' })
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ email: 'user@example.com', password: 'pass' }))
    vi.stubGlobal('setCookie', mockSetCookie)
    mockSend.mockResolvedValue({ AuthenticationResult: { AccessToken: 'at', IdToken: idToken } })

    const mod = await import('./login.post')
    const handler = mod.default as Function
    await handler({})

    expect(mockSetCookie).toHaveBeenCalledWith(expect.anything(), 'kra_user', 'user@example.com', expect.any(Object))
  })

  it('falls back to cognito:username when email claim absent from IdToken', async () => {
    const mockSetCookie = vi.fn()
    const idToken = makeIdToken({ 'cognito:username': 'myuser' })
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ email: 'user@example.com', password: 'pass' }))
    vi.stubGlobal('setCookie', mockSetCookie)
    mockSend.mockResolvedValue({ AuthenticationResult: { AccessToken: 'at', IdToken: idToken } })

    const mod = await import('./login.post')
    const handler = mod.default as Function
    await handler({})

    expect(mockSetCookie).toHaveBeenCalledWith(expect.anything(), 'kra_user', 'myuser', expect.any(Object))
  })

  it('falls back to request email when JWT decode fails', async () => {
    const mockSetCookie = vi.fn()
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ email: 'user@example.com', password: 'pass' }))
    vi.stubGlobal('setCookie', mockSetCookie)
    mockSend.mockResolvedValue({ AuthenticationResult: { AccessToken: 'at', IdToken: 'not.valid.jwt' } })

    const mod = await import('./login.post')
    const handler = mod.default as Function
    await handler({})

    expect(mockSetCookie).toHaveBeenCalledWith(expect.anything(), 'kra_user', 'user@example.com', expect.any(Object))
  })

  it('constructs client with region from cognitoDomain', async () => {
    const { CognitoIdentityProviderClient } = await import('@aws-sdk/client-cognito-identity-provider')
    const idToken = makeIdToken({ email: 'u@e.com' })
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ email: 'u@e.com', password: 'p' }))
    mockSend.mockResolvedValue({ AuthenticationResult: { AccessToken: 'at', IdToken: idToken } })

    const mod = await import('./login.post')
    const handler = mod.default as Function
    await handler({})

    expect(CognitoIdentityProviderClient).toHaveBeenCalledWith({ region: 'eu-west-1' })
  })
})
