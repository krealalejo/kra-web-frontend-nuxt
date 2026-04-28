const VALID_TYPES = ['SHIPPING', 'READING', 'PLAYING'] as const

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const rawType = getRouterParam(event, 'type') ?? ''
  const type = rawType.toUpperCase()
  if (!(VALID_TYPES as readonly string[]).includes(type)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid activity card type' })
  }

  const body = await readBody(event)

  const safeBody = {
    ...(body.title !== undefined && { title: body.title }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.tags !== undefined && { tags: body.tags }),
  }

  const response = await $fetch(`${config.apiBase}/activity/${type}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: safeBody,
  })

  return response
})
