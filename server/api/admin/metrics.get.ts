export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const url = `${config.apiBase}/admin/metrics`
  try {
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response
  } catch (err: any) {
    console.error('[metrics] url:', url)
    console.error('[metrics] token prefix:', token.substring(0, 20))
    console.error('[metrics] error status:', err?.status)
    console.error('[metrics] error data:', JSON.stringify(err?.data))
    throw err
  }
})
