export default defineNuxtRouteMiddleware((to) => {
  // Only protect /admin routes; login and callback pages are exempt
  if (to.path === '/admin/login' || to.path === '/admin/callback') {
    return
  }

  const session = useCookie('kra_session')

  if (!session.value) {
    return navigateTo('/admin/login')
  }
})
