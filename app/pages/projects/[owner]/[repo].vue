<script setup lang="ts">
import type { PortfolioRepoDto } from '~/types/portfolio'

const route = useRoute()
const config = useRuntimeConfig()

const owner = computed(() => {
  const p = route.params.owner
  return String(Array.isArray(p) ? (p[0] ?? '') : (p ?? ''))
})
const repo = computed(() => {
  const p = route.params.repo
  return String(Array.isArray(p) ? (p[0] ?? '') : (p ?? ''))
})

const { data: detail, pending, error } = useAsyncData(
  () => `portfolio-detail-${owner.value}-${repo.value}`,
  async () => {
    const o = owner.value
    const r = repo.value
    if (!o || !r) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid repository path' })
    }
    const raw = config.public.apiBase
    const apiBase = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
    if (!apiBase) {
      throw new Error('MISSING_API_BASE')
    }
    try {
      return await $fetch<PortfolioRepoDto>(`${apiBase}/portfolio/repos/${encodeURIComponent(o)}/${encodeURIComponent(r)}`)
    } catch (e: unknown) {
      const err = e as { statusCode?: number; status?: number; response?: { status?: number } }
      const code = err?.statusCode ?? err?.status ?? err?.response?.status
      if (code === 404) {
        throw createError({ statusCode: 404, statusMessage: 'NOT_FOUND' })
      }
      throw e
    }
  },
  { watch: [owner, repo], lazy: true }
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

const ogDescription = computed(() => {
  const d = detail.value?.description ?? ''
  if (!d) return 'Portfolio Project KRA'
  return d.length > 160 ? `${d.slice(0, 157)}…` : d
})

useSeoMeta({
  title: computed(() => {
    if (pending.value) return 'Project KRA'
    if (error.value) return 'Project KRA · Repository'
    return detail.value?.fullName ?? 'Project KRA'
  }),
  ogTitle: computed(() => {
    if (pending.value) return 'Project KRA'
    if (error.value) return 'Project KRA'
    return detail.value?.fullName ?? 'Project KRA'
  }),
  description: computed(() => {
    if (pending.value) return 'Loading repository…'
    if (error.value) return isNotFound.value ? 'Repository not found.' : 'Could not load the repository.'
    return detail.value?.description ?? 'Portfolio Project KRA'
  }),
  ogDescription: computed(() => {
    if (pending.value) return 'Loading repository…'
    if (error.value) return isNotFound.value ? 'Repository not found.' : 'Error loading the repository.'
    return ogDescription.value
  })
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <div
      v-if="pending"
      class="flex flex-col items-center justify-center gap-3 py-16 text-slate-600"
      role="status"
      aria-live="polite"
    >
      <span
        class="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
        aria-hidden="true"
      />
      <p>Loading repository…</p>
    </div>

    <div
      v-else-if="error"
      class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
      role="alert"
    >
      <p class="font-medium">
        Could not load the repository
      </p>
      <p
        v-if="isMissingApiBase"
        class="mt-2 text-sm"
      >
        Missing <code class="rounded bg-red-100 px-1">NUXT_PUBLIC_API_BASE_URL</code>. See <code class="rounded bg-red-100 px-1">.env.example</code>.
      </p>
      <p
        v-else-if="isNotFound"
        class="mt-2 text-sm"
      >
        Repository not found on GitHub (or not accessible).
      </p>
      <p
        v-else
        class="mt-2 text-sm"
      >
        The server did not respond correctly. Check that the API is running.
      </p>
      <p class="mt-4">
        <NuxtLink
          to="/"
          class="text-sm font-medium text-red-900 underline"
        >
          Back to home
        </NuxtLink>
      </p>
    </div>

    <article v-else-if="detail">
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900">
        {{ detail.fullName }}
      </h1>
      <p class="mt-4 text-slate-600">
        {{ detail.description || '—' }}
      </p>
      <p
        v-if="detail.topics?.length"
        class="mt-4 flex flex-wrap gap-2"
      >
        <span
          v-for="t in detail.topics"
          :key="t"
          class="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
        >{{ t }}</span>
      </p>
      <p class="mt-2 text-sm text-slate-500">
        ⭐ {{ detail.stargazersCount }} · updated {{ detail.updatedAt }}
        <span v-if="detail.defaultBranch"> · branch <code class="rounded bg-slate-100 px-1 text-xs">{{ detail.defaultBranch }}</code></span>
      </p>
      <section
        v-if="detail.readmeExcerpt"
        class="mt-8"
      >
        <h2 class="text-lg font-semibold text-slate-900">
          README (excerpt)
        </h2>
        <pre class="mt-2 whitespace-pre-wrap rounded border border-slate-200 bg-white p-4 text-sm text-slate-700">{{ detail.readmeExcerpt }}</pre>
      </section>
      <p
        v-if="detail.htmlUrl"
        class="mt-8"
      >
        <a
          :href="detail.htmlUrl"
          class="text-slate-900 underline decoration-slate-400 underline-offset-4 hover:text-slate-700"
          target="_blank"
          rel="noopener noreferrer"
        >Open on GitHub</a>
      </p>
    </article>
  </div>
</template>
