export default defineEventHandler((event) => {
  const cookie = getCookie(event, 'kra_session')
  if (!cookie) return { authenticated: false }

  try {
    const payload = JSON.parse(Buffer.from(cookie.split('.')[1], 'base64').toString('utf-8'))
    const expired = payload.exp && payload.exp * 1000 < Date.now()
    if (expired) return { authenticated: false }
  } catch {
    return { authenticated: false }
  }

  return { authenticated: true }
})
