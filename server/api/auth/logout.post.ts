export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  // Step 1: Clear the local session cookie
  deleteCookie(event, 'kra_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  // Clear the non-httpOnly email cookie (options must match setCookie in callback.get.ts)
  deleteCookie(event, 'kra_user', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  // Step 2: Redirect to Cognito federated logout
  // logout_uri must be registered in the App Client allowed logout URLs
  // After Cognito invalidates the session, it redirects the browser to logout_uri
  const logoutUri = encodeURIComponent(config.public.cognitoLogoutUri)
  const cognitoLogoutUrl = `${config.public.cognitoDomain}/logout?client_id=${config.public.cognitoClientId}&logout_uri=${logoutUri}`

  return sendRedirect(event, cognitoLogoutUrl, 302)
})
