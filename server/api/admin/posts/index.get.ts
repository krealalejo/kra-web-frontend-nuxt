export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  const response = await $fetch(`${config.public.apiBase}/posts`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  return response
})
