export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)

  const safeBody = {
    ...(body.homePortraitUrl !== undefined && { homePortraitUrl: body.homePortraitUrl }),
    ...(body.cvPortraitUrl !== undefined && { cvPortraitUrl: body.cvPortraitUrl }),
    ...(body.cvPdfUrl !== undefined && { cvPdfUrl: body.cvPdfUrl }),
  }

  const response = await $fetch(`${config.apiBase}/config/profile`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: safeBody,
  })

  return response
})
