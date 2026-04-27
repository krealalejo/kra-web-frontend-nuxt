export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)

  const safeBody = {
    ...(body.name !== undefined && { name: body.name }),
    ...(body.skills !== undefined && { skills: body.skills }),
    ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
  }

  const response = await $fetch(`${config.public.apiBase}/cv/skills/categories`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: safeBody,
  })

  return response
})
