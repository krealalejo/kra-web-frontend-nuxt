export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')
  const slug = getRouterParam(event, 'slug')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug parameter' })
  }

  const body = await readBody(event)

  try {
    const response = await $fetch(`${config.apiBase}/posts/${slug}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
    return response
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode ?? 500,
      statusMessage: err.statusMessage ?? err.message ?? 'Failed to update post',
      data: err.data,
    })
  }
})
