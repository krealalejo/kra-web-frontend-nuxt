export const useS3 = () => {
  const config = useRuntimeConfig()

  const getThumbUrl = (key: string | null | undefined): string | null => {
    if (!key) return null
    const baseUrl = (config.public.apiBase || '').replace(/\/$/, '')
    return `${baseUrl}/images/${key}`
  }

  return {
    getThumbUrl
  }
}
