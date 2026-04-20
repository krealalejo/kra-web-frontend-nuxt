<script setup lang="ts">
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { BlogPostDto } from '~/types/blog'
import { useMarkdown } from '~/composables/useMarkdown'
import { useApiError } from '~/composables/useApiError'

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

const { isMissingApiBase } = useApiError(error)

const isNotFound = computed(() => {
  const e = error.value as { statusCode?: number; statusMessage?: string } | null
  return e?.statusCode === 404 || e?.statusMessage === 'NOT_FOUND'
})

const { stripMarkdown } = useMarkdown()
const { renderDiagrams } = useMermaid()
const contentRef = ref<HTMLElement | null>(null)

const sanitizedContent = computed<string>(() => {
  const raw = post.value?.content ?? ''
  const html = marked.parse(raw) as string
  if (import.meta.server) return html
  return DOMPurify.sanitize(html)
})

watch(sanitizedContent, async () => {
  await nextTick()
  if (contentRef.value) renderDiagrams(contentRef.value)
})

onMounted(() => {
  if (contentRef.value) renderDiagrams(contentRef.value)
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
    const plain = post.value ? stripMarkdown(post.value.content) : ''
    if (!plain) return 'Project KRA blog post.'
    return plain.length > 160 ? `${plain.slice(0, 157)}…` : plain
  }),
  ogTitle: computed(() => post.value?.title ?? 'Blog · Project KRA'),
  ogDescription: computed(() => {
    if (!post.value?.content) return 'Project KRA blog.'
    const plain = stripMarkdown(post.value.content)
    return plain.length > 200 ? `${plain.slice(0, 197)}…` : plain
  }),
})
</script>

<template>
  <div>
    <p class="mb-6 text-sm">
      <NuxtLink
        to="/blog"
        class="font-medium text-slate-700 underline decoration-slate-400 underline-offset-4 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
      >
        ← All posts
      </NuxtLink>
    </p>

    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
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
        Set <code class="rounded bg-red-100 px-1 dark:bg-red-900">NUXT_PUBLIC_API_BASE_URL</code> and restart the dev server.
      </p>
    </div>

    <p v-else-if="pending" class="text-sm text-slate-600 dark:text-slate-400">
      Loading…
    </p>

    <template v-else-if="post">
      <article class="prose prose-slate max-w-none dark:prose-invert">
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {{ post.title }}
        </h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {{ formatDate(post.createdAt) }}
          <span v-if="post.updatedAt !== post.createdAt">
            · updated {{ formatDate(post.updatedAt) }}
          </span>
        </p>
        <div ref="contentRef" class="mt-8" v-html="sanitizedContent" />
      </article>

      <template v-if="post.references && post.references.length > 0">
        <hr class="my-8 border-slate-200 dark:border-slate-700" />
        <section aria-label="References">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">References</h2>
          <ul class="mt-3 space-y-1 text-sm">
            <li v-for="(ref, i) in post.references" :key="i">
              <a
                :href="ref.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 underline decoration-slate-300 underline-offset-4 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >{{ ref.label }}</a>
            </li>
          </ul>
        </section>
      </template>
    </template>
  </div>
</template>
