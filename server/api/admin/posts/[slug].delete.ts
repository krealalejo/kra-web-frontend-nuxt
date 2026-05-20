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

  try {
    await $fetch(`${config.apiBase}/posts/${slug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode ?? 500,
      statusMessage: err.statusMessage ?? err.message ?? 'Failed to delete post',
      data: err.data,
    })
  }

  return { success: true }
})
