export const useS3 = () => {
  const config = useRuntimeConfig()

  /**
   * Generates a public thumbnail URL for a given S3 key.
   * Assumes thumbnails are stored in the 'thumbnails/' prefix and follow the '-thumb.webp' suffix pattern.
   */
  const getThumbUrl = (key: string | null | undefined): string | null => {
    if (!key) return null

    // Remove the 'images/' prefix if present and add 'thumbnails/'
    // Also change extension to '-thumb.webp'
    const thumbKey = key
      .replace(/^images\//, 'thumbnails/')
      .replace(/\.[^.]+$/, '-thumb.webp')

    const baseUrl = (config.public.s3PublicBucketUrl as string || '').replace(/\/$/, '')
    return `${baseUrl}/${thumbKey}`
  }

  return {
    getThumbUrl
  }
}
