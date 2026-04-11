export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  // Step 1: Clear the local session cookie
  deleteCookie(event, 'kra_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  // Step 2: Redirect to Cognito federated logout
  // logout_uri must be registered in the App Client allowed logout URLs
  // After Cognito invalidates the session, it redirects the browser to logout_uri
  const logoutUri = encodeURIComponent(`${config.cognitoRedirectUri.replace('/api/auth/callback', '')}`)
  const cognitoLogoutUrl = `${config.public.cognitoDomain}/logout?client_id=${config.cognitoClientId}&logout_uri=${logoutUri}`

  return sendRedirect(event, cognitoLogoutUrl, 302)
})
