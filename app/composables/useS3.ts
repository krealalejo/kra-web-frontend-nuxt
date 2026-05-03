export const useS3 = () => {
  const config = useRuntimeConfig()

  const getThumbUrl = (key: string | null | undefined): string | null => {
    if (!key) return null

    const thumbKey = key
      .replace(/^images\//, 'thumbnails/')
      .replace(/\.[^.]+$/, '-thumb.webp')

    const baseUrl = (config.public.s3PublicBucketUrl || '').replace(/\/$/, '')
    return `${baseUrl}/${thumbKey}`
  }

  return {
    getThumbUrl
  }
}
