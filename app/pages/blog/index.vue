<script setup lang="ts">
import type { BlogPostDto } from '~/types/blog'
import { useGsapCardStagger } from '~/composables/useGsapAnimations'

const config = useRuntimeConfig()

const { data: posts, pending, error } = await useAsyncData(
  'blog-list',
  async () => {
    const raw = config.public.apiBase
    const apiBase = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
    if (!apiBase) {
      throw new Error('MISSING_API_BASE')
    }
    return await $fetch<BlogPostDto[]>(`${apiBase}/posts`)
  }
)

useGsapCardStagger('.blog-post-list > li')

const isMissingApiBase = computed(() => {
  const msg = error.value && typeof error.value === 'object' && 'message' in error.value
    ? String((error.value as Error).message)
    : error.value ? String(error.value) : ''
  return msg.includes('MISSING_API_BASE')
})

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso))
  } catch {
    return iso
  }
}

useSeoMeta({
  title: 'Blog · Project KRA',
  description: 'Articles and notes from Project KRA.',
  ogTitle: 'Blog · Project KRA',
  ogDescription: 'Articles and notes from Project KRA.',
})
</script>

<template>
  <div>
    <header class="mb-10">
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        Blog
      </h1>
      <p class="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
        Posts are loaded from the KRA API (DynamoDB), newest first.
      </p>
    </header>

    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
      role="alert"
    >
      <p class="font-medium">
        Could not load posts
      </p>
      <p
        v-if="isMissingApiBase"
        class="mt-2 text-sm"
      >
        Set <code class="rounded bg-red-100 px-1 dark:bg-red-900">NUXT_PUBLIC_API_BASE_URL</code> (see <code class="rounded bg-red-100 px-1 dark:bg-red-900">.env.example</code>) and restart the dev server.
      </p>
      <p
        v-else
        class="mt-2 text-sm"
      >
        The API did not respond or rejected the request. Ensure Spring Boot is running.
      </p>
    </div>

    <p v-else-if="pending" class="text-sm text-slate-600 dark:text-slate-400">
      Loading posts…
    </p>

    <ul
      v-else-if="posts && posts.length > 0"
      class="blog-post-list space-y-4"
    >
      <li
        v-for="post in posts"
        :key="post.slug"
      >
        <article class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            <NuxtLink
              :to="`/blog/${post.slug}`"
              class="hover:text-slate-700 dark:hover:text-slate-300"
            >
              {{ post.title }}
            </NuxtLink>
          </h2>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-500">
            {{ formatDate(post.createdAt) }}
          </p>
          <p class="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {{ post.content }}
          </p>
          <p class="mt-4">
            <NuxtLink
              :to="`/blog/${post.slug}`"
              class="text-sm font-medium text-slate-900 underline decoration-slate-400 underline-offset-4 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
            >
              Read full post
            </NuxtLink>
          </p>
        </article>
      </li>
    </ul>

    <p
      v-else
      class="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
    >
      No posts yet. Create one from the admin dashboard when it is available.
    </p>
  </div>
</template>
