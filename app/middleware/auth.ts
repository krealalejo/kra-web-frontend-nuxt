export default defineNuxtRouteMiddleware(async (to) => {
  // Only protect /admin routes; login and callback pages are exempt
  if (to.path === '/admin/login' || to.path === '/admin/callback') {
    return
  }

  // Use a server-side session check — the kra_session cookie is httpOnly and
  // cannot be read from client-side JavaScript (useCookie returns null in SPA mode).
  const { data } = await useFetch('/api/auth/session')
  if (!data.value?.authenticated) {
    return navigateTo('/admin/login')
  }
})
