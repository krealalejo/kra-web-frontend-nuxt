<script setup lang="ts">
import type { BlogPostDto } from '~/types/blog'

const route = useRoute()
const config = useRuntimeConfig()

const slug = computed(() => {
  const p = route.params.slug
  return String(Array.isArray(p) ? (p[0] ?? '') : (p ?? ''))
})

const { data: post, pending, error } = await useAsyncData(
  () => `blog-post-${slug.value}`,
  async () => {
    const s = slug.value
    if (!s) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid post slug' })
    }
    const raw = config.public.apiBase
    const apiBase = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
    if (!apiBase) {
      throw new Error('MISSING_API_BASE')
    }
    try {
      return await $fetch<BlogPostDto>(`${apiBase}/posts/${encodeURIComponent(s)}`)
    } catch (e: unknown) {
      const err = e as { statusCode?: number; status?: number; response?: { status?: number } }
      const code = err?.statusCode ?? err?.status ?? err?.response?.status
      if (code === 404) {
        throw createError({ statusCode: 404, statusMessage: 'NOT_FOUND' })
      }
      throw e
    }
  },
  { watch: [slug] }
)

const isMissingApiBase = computed(() => {
  const msg = error.value && typeof error.value === 'object' && 'message' in error.value
    ? String((error.value as Error).message)
    : error.value ? String(error.value) : ''
  return msg.includes('MISSING_API_BASE')
})

const isNotFound = computed(() => {
  const e = error.value as { statusCode?: number; statusMessage?: string } | null
  return e?.statusCode === 404 || e?.statusMessage === 'NOT_FOUND'
})

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(iso))
  } catch {
    return iso
  }
}

useSeoMeta({
  title: computed(() => {
    if (pending.value) return 'Blog · Project KRA'
    if (error.value && !isNotFound.value) return 'Blog · Project KRA'
    if (isNotFound.value) return 'Post not found · Project KRA'
    return post.value ? `${post.value.title} · Blog` : 'Blog · Project KRA'
  }),
  description: computed(() => {
    if (pending.value) return 'Loading post…'
    if (isNotFound.value) return 'This post does not exist.'
    if (error.value) return 'Could not load the post.'
    const c = post.value?.content ?? ''
    const plain = c.replace(/\s+/g, ' ').trim()
    if (!plain) return 'Project KRA blog post.'
    return plain.length > 160 ? `${plain.slice(0, 157)}…` : plain
  }),
  ogTitle: computed(() => post.value?.title ?? 'Blog · Project KRA'),
  ogDescription: computed(() => {
    if (!post.value?.content) return 'Project KRA blog.'
    const plain = post.value.content.replace(/\s+/g, ' ').trim()
    return plain.length > 200 ? `${plain.slice(0, 197)}…` : plain
  }),
})
</script>

<template>
  <div>
    <p class="mb-6 text-sm">
      <NuxtLink
        to="/blog"
        class="font-medium text-slate-700 underline decoration-slate-400 underline-offset-4 hover:text-slate-900"
      >
        ← All posts
      </NuxtLink>
    </p>

    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
      role="alert"
    >
      <p class="font-medium">
        <span v-if="isNotFound">Post not found</span>
        <span v-else>Could not load post</span>
      </p>
      <p
        v-if="isMissingApiBase"
        class="mt-2 text-sm"
      >
        Set <code class="rounded bg-red-100 px-1">NUXT_PUBLIC_API_BASE_URL</code> and restart the dev server.
      </p>
    </div>

    <p v-else-if="pending" class="text-sm text-slate-600">
      Loading…
    </p>

    <article
      v-else-if="post"
      class="prose prose-slate max-w-none"
    >
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900">
        {{ post.title }}
      </h1>
      <p class="mt-2 text-sm text-slate-500">
        {{ formatDate(post.createdAt) }}
        <span v-if="post.updatedAt !== post.createdAt">
          · updated {{ formatDate(post.updatedAt) }}
        </span>
      </p>
      <div
        class="mt-8 whitespace-pre-wrap text-base leading-relaxed text-slate-800"
      >
        {{ post.content }}
      </div>
    </article>
  </div>
</template>
