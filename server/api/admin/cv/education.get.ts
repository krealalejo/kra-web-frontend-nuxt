export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const response = await $fetch(`${config.apiBase}/cv/education`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  return response
})
