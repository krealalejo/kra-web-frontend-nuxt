export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)

  const { name, skills, sortOrder } = body

  if (!name) {
    throw createError({ statusCode: 422, statusMessage: 'Missing required fields' })
  }
  if (sortOrder !== undefined && (typeof sortOrder !== 'number' || !Number.isInteger(sortOrder) || sortOrder < 1)) {
    throw createError({ statusCode: 422, statusMessage: 'sortOrder must be a positive integer' })
  }
  if (skills !== undefined) {
    if (!Array.isArray(skills) || !skills.every((s: unknown) => typeof s === 'string')) {
      throw createError({ statusCode: 422, statusMessage: 'skills must be an array of strings' })
    }
  }

  const safeBody = {
    name,
    ...(skills !== undefined && { skills }),
    ...(sortOrder !== undefined && { sortOrder }),
  }

  const response = await $fetch(`${config.public.apiBase}/cv/skills/categories`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: safeBody,
  })

  return response
})
