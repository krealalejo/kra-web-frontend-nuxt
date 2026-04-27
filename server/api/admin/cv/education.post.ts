export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)

  const safeBody = {
    ...(body.title !== undefined && { title: body.title }),
    ...(body.institution !== undefined && { institution: body.institution }),
    ...(body.location !== undefined && { location: body.location }),
    ...(body.years !== undefined && { years: body.years }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
  }

  const response = await $fetch(`${config.public.apiBase}/cv/education`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: safeBody,
  })

  return response
})
