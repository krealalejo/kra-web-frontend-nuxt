export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login' || to.path === '/admin/callback') {
    return
  }

  const { data } = await useFetch('/api/auth/session')
  if (!data.value?.authenticated) {
    return navigateTo('/admin/login')
  }
})
