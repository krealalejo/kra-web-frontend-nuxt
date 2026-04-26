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

  // Derive thumbnail key from image key per D-07:
  // "images/abc123.jpg" → "thumbnails/abc123-thumb.webp"
  const thumbKey = key
    .replace(/^images\//, 'thumbnails/')
    .replace(/\.[^.]+$/, '-thumb.webp')

  const s3BucketUrl = config.s3BucketUrl // private runtimeConfig — server-only

  try {
    await $fetch(`${s3BucketUrl}/${thumbKey}`, { method: 'HEAD' })
    return { ready: true }
  } catch {
    return { ready: false }
  }
})
