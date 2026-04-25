export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)

  const response = await $fetch(`${config.public.apiBase}/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })

  return response
})
