export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id parameter' })
  }

  const body = await readBody(event)

  const safeBody = {
    ...(body.title !== undefined && { title: body.title }),
    ...(body.company !== undefined && { company: body.company }),
    ...(body.location !== undefined && { location: body.location }),
    ...(body.years !== undefined && { years: body.years }),
    ...(body.description !== undefined && { description: body.description }),
  }

  const response = await $fetch(`${config.apiBase}/cv/experience/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: safeBody,
  })

  return response
})
