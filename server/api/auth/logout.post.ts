export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  deleteCookie(event, 'kra_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  deleteCookie(event, 'kra_user', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  const logoutUri = encodeURIComponent(config.public.cognitoLogoutUri)
  const cognitoLogoutUrl = `${config.public.cognitoDomain}/logout?client_id=${config.public.cognitoClientId}&logout_uri=${logoutUri}`

  return sendRedirect(event, cognitoLogoutUrl, 302)
})
