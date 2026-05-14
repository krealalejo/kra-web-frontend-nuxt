export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = (config.apiBase as string).replace(/\/$/, '')

  try {
    const posts = await $fetch<Array<{ slug: string; updatedAt: string }>>(`${apiBase}/posts`)
    return posts.map(post => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.updatedAt,
      changefreq: 'monthly' as const,
      priority: 0.8,
    }))
  } catch {
    return []
  }
})
