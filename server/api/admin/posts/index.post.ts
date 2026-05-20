export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)

  try {
    const response = await $fetch(`${config.apiBase}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
    return response
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode ?? 500,
      statusMessage: err.statusMessage ?? err.message ?? 'Failed to create post',
      data: err.data,
    })
  }
})
