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

  await $fetch(`${config.apiBase}/posts/${slug}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  return { success: true }
})
