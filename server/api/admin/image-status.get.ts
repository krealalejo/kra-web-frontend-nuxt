export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const key = query.key as string

  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'Missing key parameter' })
  }

  const apiBase = config.apiBase.replace(/\/$/, '')

  try {
    await $fetch(`${apiBase}/images/${key}`, { method: 'HEAD' })
    return { ready: true }
  } catch {
    return { ready: false }
  }
})
