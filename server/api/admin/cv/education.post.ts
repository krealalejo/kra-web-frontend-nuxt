export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)

  const { title, institution, location, years, description, sortOrder } = body

  if (!title || !institution || !location || !years || !description) {
    throw createError({ statusCode: 422, statusMessage: 'Missing required fields' })
  }
  if (sortOrder !== undefined && (typeof sortOrder !== 'number' || !Number.isInteger(sortOrder) || sortOrder < 1)) {
    throw createError({ statusCode: 422, statusMessage: 'sortOrder must be a positive integer' })
  }

  const safeBody = {
    title,
    institution,
    location,
    years,
    description,
    ...(sortOrder !== undefined && { sortOrder }),
  }

  const response = await $fetch(`${config.apiBase}/cv/education`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: safeBody,
  })

  return response
})
