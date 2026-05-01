export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const response = await $fetch(`${config.apiBase}/admin/cache/flush`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

  return response
})
