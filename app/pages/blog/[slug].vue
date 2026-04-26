<script setup lang="ts">
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { BlogPostDto } from '~/types/blog'
import { useMarkdown } from '~/composables/useMarkdown'
import { useApiError } from '~/composables/useApiError'
import gsap from 'gsap'

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
    if (!s) throw createError({ statusCode: 400, statusMessage: 'Invalid post slug' })
    const raw = config.public.apiBase
    const apiBase = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
    if (!apiBase) throw new Error('MISSING_API_BASE')
    try {
      return await $fetch<BlogPostDto>(`${apiBase}/posts/${encodeURIComponent(s)}`)
    } catch (e: unknown) {
      const err = e as { statusCode?: number; status?: number; response?: { status?: number } }
      const code = err?.statusCode ?? err?.status ?? err?.response?.status
      if (code === 404) throw createError({ statusCode: 404, statusMessage: 'NOT_FOUND' })
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

const { stripMarkdown, sanitizeMarkdown } = useMarkdown()
const { renderDiagrams } = useMermaid()
const contentRef = ref<HTMLElement | null>(null)

const sanitizedContent = ref<string>('')

async function updateSanitizedContent() {
  const raw = post.value?.content ?? ''
  if (raw) {
    sanitizedContent.value = await sanitizeMarkdown(raw)
  } else {
    sanitizedContent.value = ''
  }
}

await updateSanitizedContent()

watch(post, async () => {
  await updateSanitizedContent()
  await nextTick()
  if (contentRef.value) renderDiagrams(contentRef.value)
})

onMounted(() => {
  if (contentRef.value) renderDiagrams(contentRef.value)
  gsap.fromTo('.post-head', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
  gsap.fromTo('.post-body', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.2 })
})

const thumbUrl = computed(() => {
  if (!post.value?.imageUrl) return null
  const thumbKey = post.value.imageUrl
    .replace(/^images\//, 'thumbnails/')
    .replace(/\.[^.]+$/, '-thumb.webp')
  return `${config.public.s3PublicBucketUrl}/${thumbKey}`
})

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  } catch { return iso }
}

useSeoMeta({
  title: computed(() => {
    if (pending.value) return 'Posts · Kevin Real Alejo'
    if (isNotFound.value) return 'Post not found · Kevin Real Alejo'
    if (error.value) return 'Posts · Kevin Real Alejo'
    return post.value ? `${post.value.title} · Kevin Real Alejo` : 'Posts · Kevin Real Alejo'
  }),
  description: computed(() => {
    if (pending.value) return 'Loading post…'
    if (isNotFound.value) return 'This post does not exist.'
    if (error.value) return 'Could not load the post.'
    const plain = post.value ? stripMarkdown(post.value.content) : ''
    return plain.length > 160 ? `${plain.slice(0, 157)}…` : plain
  }),
})
</script>

<template>
  <div>
    <div v-if="error" role="alert" class="shell" style="padding:64px 0;">
      <div style="font-family:var(--font-mono);font-size:12px;color:var(--fg-muted);">
        <div v-if="isNotFound">Post not found.</div>
        <div v-else-if="isMissingApiBase">API unavailable — set NUXT_PUBLIC_API_BASE_URL.</div>
        <div v-else>Could not load post.</div>
        <NuxtLink to="/blog" style="display:inline-flex;align-items:center;gap:8px;margin-top:24px;color:var(--accent);">← All posts</NuxtLink>
      </div>
    </div>

    <template v-else-if="post">
      <section class="shell">
        <div class="post-head">
          <NuxtLink to="/blog" class="pd-breadcrumb">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M10 6H2M2 6L6 2M2 6L6 10"/>
            </svg>
            All posts
          </NuxtLink>

          <div class="overline-meta">
            <span>§05 · Writing</span>
            <span class="dot" />
            <span>{{ formatDate(post.createdAt) }}</span>
            <span v-if="post.updatedAt !== post.createdAt">
              <span class="dot" />
              Updated {{ formatDate(post.updatedAt) }}
            </span>
          </div>

          <h1>{{ post.title }}</h1>

          <div v-if="post.content" class="lede">
            {{ stripMarkdown(post.content).slice(0, 200) }}{{ stripMarkdown(post.content).length > 200 ? '…' : '' }}
          </div>
        </div>

        <div v-if="thumbUrl" class="post-thumb">
          <img :src="thumbUrl" :alt="post.title" />
        </div>

        <div class="post-body">
          <div class="content drop-p" ref="contentRef" v-html="sanitizedContent" />

          <aside>
            <section v-if="post.references?.length" aria-label="References" class="post-toc">
              <h5>References</h5>
              <ul>
                <li v-for="(ref, i) in post.references" :key="i">
                  <a :href="ref.url" target="_blank" rel="noopener noreferrer">{{ ref.label }}</a>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </section>
    </template>

    <div v-else-if="pending" class="shell" style="padding:64px 0;font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);letter-spacing:0.14em;text-transform:uppercase;">
      Loading…
    </div>
  </div>
</template>
