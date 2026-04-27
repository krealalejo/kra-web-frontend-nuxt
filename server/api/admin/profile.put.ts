export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)

  // Only forward known fields — prevents transparent-proxy pass-through of
  // unexpected properties (e.g. pk, sk) to the backend.
  const safeBody = {
    ...(body.homePortraitUrl !== undefined && { homePortraitUrl: body.homePortraitUrl }),
    ...(body.cvPortraitUrl !== undefined && { cvPortraitUrl: body.cvPortraitUrl }),
  }

  const response = await $fetch(`${config.apiBase}/config/profile`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: safeBody,
  })

  return response
})
