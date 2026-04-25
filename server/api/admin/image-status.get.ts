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

  const thumbKey = key
    .replace(/^images\//, 'thumbnails/')
    .replace(/\.[^.]+$/, '-thumb.webp')

  const s3BucketUrl = config.s3BucketUrl
  if (!s3BucketUrl) {
    console.error('S3 Bucket URL is not configured in runtimeConfig')
    return { ready: false }
  }

  try {
    await $fetch(`${s3BucketUrl}/${thumbKey}`, { method: 'HEAD' })
    return { ready: true }
  } catch {
    return { ready: false }
  }
})
