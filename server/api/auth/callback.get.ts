export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string | undefined
  const errorParam = query.error as string | undefined

  if (errorParam || !code) {
    const msg = errorParam || 'missing_code'
    return sendRedirect(event, `/admin/login?error=${encodeURIComponent(msg)}`, 302)
  }

  const config = useRuntimeConfig(event)
  const tokenUrl = `${config.public.cognitoDomain}/oauth2/token`

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.public.cognitoRedirectUri,
    client_id: config.public.cognitoClientId,
    client_secret: config.cognitoClientSecret,
  })

  let tokenData: { id_token?: string; access_token?: string; refresh_token?: string; error?: string; error_description?: string }

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!response.ok && response.headers.get('content-type')?.includes('application/json') === false) {
      return sendRedirect(event, `/admin/login?error=${encodeURIComponent('token_fetch_failed')}`, 302)
    }

    tokenData = await response.json()
  } catch {
    return sendRedirect(event, `/admin/login?error=${encodeURIComponent('token_fetch_failed')}`, 302)
  }

  if (tokenData.error || !tokenData.access_token) {
    const msg = tokenData.error || 'token_exchange_failed'
    return sendRedirect(event, `/admin/login?error=${encodeURIComponent(msg)}`, 302)
  }

  setCookie(event, 'kra_session', tokenData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  })

  let emailValue = 'admin'
  try {
    const idTokenForEmail = tokenData.id_token || tokenData.access_token
    const payloadB64 = idTokenForEmail?.split('.')[1]
    if (!payloadB64) throw new Error('invalid_token_structure')
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8'))
    emailValue = decoded.email || decoded['cognito:username'] || 'admin'
  } catch {
  }

  setCookie(event, 'kra_user', emailValue, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  })

  return sendRedirect(event, '/admin', 302)
})
