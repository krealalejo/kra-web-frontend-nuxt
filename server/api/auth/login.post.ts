import crypto from 'node:crypto'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  NotAuthorizedException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider'

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

const ipAttempts = new Map<string, { count: number; resetAt: number }>()
export const _resetRateLimitForTest = () => ipAttempts.clear()

function checkRateLimit(ip: string): void {
  const now = Date.now()
  const entry = ipAttempts.get(ip)

  if (!entry || now > entry.resetAt) {
    ipAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  entry.count++
  if (entry.count > MAX_ATTEMPTS) {
    throw createError({ statusCode: 429, message: 'Too many login attempts — try again in 15 minutes' })
  }
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  checkRateLimit(ip)

  const body = await readBody(event)
  const email = body?.email?.trim()
  const password = body?.password

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  if (password.length > 256) {
    throw createError({ statusCode: 400, message: 'Invalid credentials' })
  }

  const config = useRuntimeConfig(event)

  const secretHash = crypto
    .createHmac('SHA256', config.cognitoClientSecret)
    .update(email + config.public.cognitoClientId)
    .digest('base64')

  const regionMatch = /\.auth\.([^.]+)\.amazoncognito\.com/.exec(config.public.cognitoDomain)
  const region = regionMatch?.[1] ?? 'eu-west-1'

  const client = new CognitoIdentityProviderClient({ region })

  let tokens: { AccessToken?: string; IdToken?: string }

  try {
    const result = await client.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: config.public.cognitoClientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          SECRET_HASH: secretHash,
        },
      }),
    )

    if (result.ChallengeName) {
      throw createError({ statusCode: 403, message: 'Password reset required — contact admin' })
    }

    tokens = result.AuthenticationResult ?? {}
  } catch (err: unknown) {
    if (err instanceof NotAuthorizedException || err instanceof UserNotFoundException) {
      throw createError({ statusCode: 401, message: 'Incorrect email or password' })
    }
    throw err
  }

  if (!tokens.AccessToken) {
    throw createError({ statusCode: 500, message: 'Invalid authentication response' })
  }

  const secure = !import.meta.dev

  setCookie(event, 'kra_session', tokens.AccessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  })

  let emailValue = email
  try {
    const payloadB64 = (tokens.IdToken ?? tokens.AccessToken).split('.')[1]
    if (!payloadB64) throw new Error('invalid_token')
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8'))
    emailValue = decoded.email || decoded['cognito:username'] || email
  } catch {}

  setCookie(event, 'kra_user', emailValue, {
    httpOnly: false,
    secure,
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  })

  return { ok: true }
})
