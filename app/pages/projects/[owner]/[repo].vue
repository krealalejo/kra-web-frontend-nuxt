<script setup lang="ts">
import type { PortfolioRepoDto } from '~/types/portfolio'
import { useMarkdown } from '~/composables/useMarkdown'
import IconBrandGithub from '~/components/icons/IconBrandGithub.vue'
import { useApiError } from '~/composables/useApiError'

const route = useRoute()
const config = useRuntimeConfig()

const owner = computed(() => {
  const p = route.params.owner
  /* v8 ignore next 1 */
  return String(Array.isArray(p) ? (p[0] ?? '') : (p ?? ''))
})
const repo = computed(() => {
  const p = route.params.repo
  /* v8 ignore next 1 */
  return String(Array.isArray(p) ? (p[0] ?? '') : (p ?? ''))
})

const { data: detail, pending, error } = useAsyncData(
  () => `portfolio-detail-${owner.value}-${repo.value}`,
  async () => {
    const o = owner.value
    const r = repo.value
    if (!o || !r) throw createError({ statusCode: 400, statusMessage: 'Invalid repository path' })
    const raw = config.public.apiBase
    const apiBase = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
    if (!apiBase) throw new Error('MISSING_API_BASE')
    try {
      return await $fetch<PortfolioRepoDto>(`${apiBase}/portfolio/repos/${encodeURIComponent(o)}/${encodeURIComponent(r)}`)
    } catch (e: unknown) {
      const err = e as { statusCode?: number; status?: number; response?: { status?: number } }
      const code = err?.statusCode ?? err?.status ?? err?.response?.status
      if (code === 404) throw createError({ statusCode: 404, statusMessage: 'NOT_FOUND' })
      throw e
    }
  },
  { watch: [owner, repo], lazy: true }
)

interface ProjectMetadataResponse {
  role: string | null
  year: string | null
  kind: string | null
  mainBranch: string | null
  stack: string[] | null
}

const { data: metadata } = useAsyncData<ProjectMetadataResponse | null>(
  () => `project-metadata-${owner.value}-${repo.value}`,
  async () => {
    const raw = config.public.apiBase
    const apiBase = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
    return await $fetch<ProjectMetadataResponse>(
      `${apiBase}/projects/metadata/${encodeURIComponent(owner.value)}/${encodeURIComponent(repo.value)}`
    ).catch(() => null)
  },
  { watch: [owner, repo], lazy: true }
)

const { isMissingApiBase } = useApiError(error)

const isNotFound = computed(() => {
  const e = error.value as { statusCode?: number; statusMessage?: string } | null
  return e?.statusCode === 404 || e?.statusMessage === 'NOT_FOUND'
})

const { sanitizeMarkdown, extractHeadings } = useMarkdown()
const { renderDiagrams, reRender } = useMermaid()
const { isDark } = useTheme()
const readmeRef = ref<HTMLElement | null>(null)
const sanitizedReadme = ref<string>('')
const headings = ref<{ title: string; id: string }[]>([])

watch(isDark, async () => {
  if (readmeRef.value) {
    await nextTick()
    reRender(readmeRef.value)
  }
})

watch(() => detail.value?.readmeExcerpt, async (val) => {
  sanitizedReadme.value = val ? await sanitizeMarkdown(val) : ''
  headings.value = val ? extractHeadings(val) : []
}, { immediate: true })

watch(sanitizedReadme, async (val) => {
  if (val && readmeRef.value) {
    await nextTick()
    renderDiagrams(readmeRef.value)
  }
})

useSeoMeta({
  title: computed(() => {
    if (pending.value) return 'Project · Kevin Real Alejo'
    if (error.value) return 'Project · Kevin Real Alejo'
    return detail.value ? `${detail.value.fullName} · Kevin Real Alejo` : 'Project · Kevin Real Alejo'
  }),
  description: computed(() => {
    if (pending.value) return 'Loading repository…'
    if (error.value) return isNotFound.value ? 'Repository not found.' : 'Could not load the repository.'
    return detail.value?.description ?? 'Portfolio project by Kevin Real Alejo.'
  }),
})

function projectKind(d: PortfolioRepoDto) {
  if (d.topics?.includes('backend')) return 'Backend'
  if (d.topics?.includes('frontend')) return 'Frontend'
  if (d.topics?.includes('serverless')) return 'Serverless'
  return 'Code'
}

function animateIn() {
  /* v8 ignore next 1 */
  if (globalThis.window !== undefined && globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  nextTick(async () => {
    const { gsap } = await useGsap()
    gsap.fromTo('.pd-head', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    gsap.fromTo('.pd-body', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.15 })
  })
}

watch(pending, async (isPending) => {
  if (!isPending && detail.value && !error.value) {
    animateIn()
  }
})

onMounted(async () => {
  if (!pending.value && detail.value && !error.value) {
    animateIn()
    /* v8 ignore next 3 */
    if (readmeRef.value && sanitizedReadme.value) {
      await nextTick()
      renderDiagrams(readmeRef.value)
    }
  }
})
</script>

<template>
  <div>
    <output v-if="pending" aria-label="Loading repository" style="display:flex;align-items:center;justify-content:center;min-height:40vh;">
      <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);letter-spacing:0.14em;text-transform:uppercase;">Loading repository…</span>
    </output>

    <div v-else-if="error" role="alert" class="shell" style="padding:64px 0;">
      <div style="font-family:var(--font-mono);font-size:12px;color:var(--fg-muted);padding:32px 0;">
        <div v-if="isNotFound">Repository not found.</div>
        <div v-else-if="isMissingApiBase">API unavailable — Missing NUXT_PUBLIC_API_BASE_URL.</div>
        <div v-else>Could not load the repository.</div>
        <NuxtLink to="/" style="display:inline-flex;align-items:center;gap:8px;margin-top:24px;color:var(--accent);">
          ← Back to home
        </NuxtLink>
      </div>
    </div>

    <template v-else-if="detail">
      <section class="shell">
        <div class="pd-head">
          <NuxtLink to="/projects" class="pd-breadcrumb">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M10 6H2M2 6L6 2M2 6L6 10"/>
            </svg>
            All projects
          </NuxtLink>

          <div class="pd-meta-row">
            <span>{{ metadata?.kind || projectKind(detail) }}</span>
            <span class="dot" />
            <span class="star">★ {{ detail.stargazersCount }}</span>
            <span class="dot" />
            <span>{{ new Date(detail.updatedAt).getFullYear() }}</span>
            <span v-if="detail.defaultBranch">
              <span class="dot" />
              ⎇ {{ detail.defaultBranch }}
            </span>
            <a
              v-if="detail.htmlUrl"
              :href="detail.htmlUrl"
              target="_blank"
              rel="noopener noreferrer"
              style="display:inline-flex;align-items:center;gap:6px;color:var(--accent);margin-left:auto;"
            >
              <IconBrandGithub style="width:14px;height:14px;" />
              GitHub ↗
            </a>
          </div>

          <h1 class="t-h1" style="margin-bottom:16px;">
            {{ detail.fullName }}
          </h1>

          <p class="t-body-lg" style="margin-bottom:20px;">
            {{ detail.description || '—' }}
          </p>

          <div v-if="detail.topics?.length" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
            <span v-for="t in detail.topics" :key="t" class="chip" style="font-size:10px;">{{ t }}</span>
          </div>
        </div>

        <div class="pd-body">
          <div v-if="detail.readmeExcerpt" class="pd-content">
            <h2 id="readme" class="t-h2" style="margin-top:0; margin-bottom: 40px; color: var(--fg);">README</h2>
            <div ref="readmeRef" class="markdown-content prose dark:prose-invert" v-html="sanitizedReadme" />
          </div>
          <div v-else class="pd-content">
            <p style="color:var(--fg-muted);font-family:var(--font-mono);font-size:12px;">No README available.</p>
          </div>

          <ProjectSidebar
            v-if="metadata && (metadata.role || metadata.year || metadata.kind || metadata.mainBranch || metadata.stack?.length)"
            :role="metadata.role"
            :year="metadata.year"
            :kind="metadata.kind"
            :main-branch="metadata.mainBranch"
            :stack="metadata.stack"
            :stars="detail.stargazersCount"
            :headings="headings"
          />
        </div>
      </section>
    </template>
  </div>
</template>

