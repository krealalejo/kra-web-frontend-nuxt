<script setup lang="ts">
import type { BlogPostDto } from '~/types/blog'
import gsap from 'gsap'

const config = useRuntimeConfig()

const { data: posts, error, pending } = useAsyncData('blog-list', async () => {
  const apiBase = (config.public.apiBase as string).replace(/\/$/, '')
  if (!apiBase) throw new Error('MISSING_API_BASE')
  return await $fetch<BlogPostDto[]>(`${apiBase}/posts`)
}, { lazy: true })

function formatDate(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function postNum(i: number) { return String(i + 1).padStart(2, '0') }
function getThumbUrl(post: BlogPostDto) {
  if (!post.imageUrl) return null
  const thumbKey = post.imageUrl
    .replace(/^images\//, 'thumbnails/')
    .replace(/\.[^.]+$/, '-thumb.webp')
  return `${config.public.s3PublicBucketUrl}/${thumbKey}`
}

onMounted(() => {
  gsap.fromTo('.page-head .overline', { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.6 })
  gsap.fromTo('.page-head h1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.1, ease: 'power3.out' })
  gsap.fromTo('.blog-row', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.2, stagger: 0.08 })
})

watch(pending, (isPending) => {
  if (!isPending) {
    nextTick(() => {
      gsap.fromTo('.blog-row', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 })
    })
  }
})

useSeoMeta({ title: 'Posts · Kevin Real Alejo', description: 'Field notes and essays on architecture, tooling, and shipping software.' })
</script>

<template>
  <div>
    <header class="page-head">
      <div class="shell">
        <div class="overline"><span class="bar" /> §05 — Writing</div>
        <h1>Field notes &amp; <em>essays</em>.</h1>
        <p class="kicker">Short-form thinking on architecture, tooling, and the craft of shipping software that holds up on a Friday afternoon.</p>
      </div>
    </header>

    <section class="shell" style="padding-bottom:80px;">
      <div v-if="error" style="color:var(--fg-muted);font-family:var(--font-mono);font-size:12px;padding:40px 0;">
        API unavailable — set NUXT_PUBLIC_API_BASE_URL.
      </div>

      <div v-else-if="pending" class="blog-list">
        <SkeletonBlogRow v-for="i in 5" :key="i" />
      </div>

      <div v-else-if="!posts?.length" style="color:var(--fg-muted);font-family:var(--font-mono);font-size:12px;padding:40px 0;">
        No posts yet.
      </div>

      <div v-else class="blog-list">
        <NuxtLink
          v-for="(post, i) in posts"
          :key="post.slug"
          :to="`/blog/${post.slug}`"
          class="blog-row"
        >
          <span class="num">{{ postNum(i) }}</span>
          <span class="date">{{ formatDate(post.createdAt) }}</span>
          <img v-if="post.imageUrl" :src="getThumbUrl(post)!" :alt="post.title" class="post-thumb" />
          <div>
            <h2 class="title">{{ post.title }}</h2>
            <p style="font-size:14px;color:var(--fg-muted);margin-top:6px;max-width:60ch;">
              {{ post.content?.slice(0, 140) }}{{ (post.content?.length ?? 0) > 140 ? '…' : '' }}
            </p>
          </div>
          <div style="display:flex;align-items:center;gap:16px;">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--fg-muted)">
              <path d="M2 10L10 2M10 2H4M10 2v6"/>
            </svg>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
