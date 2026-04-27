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

  // sortOrder intentionally excluded — PUT preserves existing sortOrder per D-08
  // skills list fully replaced when non-null (backend patch semantics from Phase 26)
  const safeBody = {
    ...(body.name !== undefined && { name: body.name }),
    ...(body.skills !== undefined && { skills: body.skills }),
  }

  const response = await $fetch(`${config.public.apiBase}/cv/skills/categories/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: safeBody,
  })

  return response
})
