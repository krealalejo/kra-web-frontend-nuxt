<script setup lang="ts">
import type { PortfolioRepoDto } from '~/types/portfolio'
import gsap from 'gsap'
import { useMarkdown } from '~/composables/useMarkdown'
import IconBrandGithub from '~/components/icons/IconBrandGithub.vue'
import { useApiError } from '~/composables/useApiError'

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

const { isMissingApiBase } = useApiError(error)

const isNotFound = computed(() => {
  const e = error.value as { statusCode?: number; statusMessage?: string } | null
  return e?.statusCode === 404 || e?.statusMessage === 'NOT_FOUND'
})

const { sanitizeMarkdown } = useMarkdown()
const { renderDiagrams } = useMermaid()
const readmeRef = ref<HTMLElement | null>(null)
const sanitizedReadme = ref<string>('')

watch(() => detail.value?.readmeExcerpt, async (val) => {
  sanitizedReadme.value = val ? await sanitizeMarkdown(val) : ''
}, { immediate: true })

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
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  nextTick(() => {
    gsap.fromTo('.pd-head', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    gsap.fromTo('.pd-body', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.15 })
  })
}

watch(pending, async (isPending) => {
  if (!isPending && detail.value && !error.value) {
    animateIn()
    await nextTick()
    if (readmeRef.value) renderDiagrams(readmeRef.value)
  }
})

onMounted(async () => {
  if (!pending.value && detail.value && !error.value) {
    animateIn()
    await nextTick()
    if (readmeRef.value) renderDiagrams(readmeRef.value)
  }
})
</script>

<template>
  <div>
    <div v-if="pending" style="display:flex;align-items:center;justify-content:center;min-height:40vh;">
      <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);letter-spacing:0.14em;text-transform:uppercase;">Loading…</span>
    </div>

    <div v-else-if="error" class="shell" style="padding:64px 0;">
      <div style="font-family:var(--font-mono);font-size:12px;color:var(--fg-muted);padding:32px 0;">
        <div v-if="isNotFound">Repository not found.</div>
        <div v-else-if="isMissingApiBase">API unavailable — set NUXT_PUBLIC_API_BASE_URL.</div>
        <div v-else">Could not load repository.</div>
        <NuxtLink to="/projects" style="display:inline-flex;align-items:center;gap:8px;margin-top:24px;color:var(--accent);">
          ← Back to projects
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

          <h1 style="font-family:var(--font-display);font-size:clamp(40px,6vw,80px);line-height:0.97;letter-spacing:-0.03em;font-weight:500;margin-bottom:16px;">
            {{ detail.name }}
          </h1>
          <p style="font-size:18px;color:var(--fg-dim);max-width:60ch;margin-bottom:20px;">
            {{ detail.description || '—' }}
          </p>

          <div class="pd-meta-row">
            <span>{{ projectKind(detail) }}</span>
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

          <div v-if="detail.topics?.length" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:20px;">
            <span v-for="t in detail.topics" :key="t" class="chip" style="font-size:10px;">{{ t }}</span>
          </div>
        </div>

        <div class="pd-body">
          <div v-if="detail.readmeExcerpt" class="pd-content">
            <div ref="readmeRef" v-html="sanitizedReadme" />
          </div>
          <div v-else class="pd-content">
            <p style="color:var(--fg-muted);font-family:var(--font-mono);font-size:12px;">No README available.</p>
          </div>

          <aside class="pd-sidebar">
            <h5>Details</h5>
            <div style="display:flex;flex-direction:column;gap:14px;margin-top:14px;">
              <div>
                <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg-muted);margin-bottom:6px;">Owner</div>
                <div style="font-size:14px;color:var(--fg);">{{ detail.owner }}</div>
              </div>
              <div>
                <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg-muted);margin-bottom:6px;">Stars</div>
                <div style="font-size:14px;color:var(--fg);">{{ detail.stargazersCount }}</div>
              </div>
              <div v-if="detail.defaultBranch">
                <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg-muted);margin-bottom:6px;">Default branch</div>
                <div style="font-size:14px;color:var(--fg);font-family:var(--font-mono);">{{ detail.defaultBranch }}</div>
              </div>
              <div>
                <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg-muted);margin-bottom:6px;">Last updated</div>
                <div style="font-size:14px;color:var(--fg);">{{ new Date(detail.updatedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) }}</div>
              </div>
              <div v-if="detail.htmlUrl" style="margin-top:8px;">
                <a :href="detail.htmlUrl" target="_blank" rel="noopener noreferrer" class="btn btn-ghost" style="width:100%;justify-content:center;display:flex;">
                  View on GitHub ↗
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
@media (max-width: 800px) {
  .pd-body { grid-template-columns: 1fr !important; }
  .pd-sidebar { position: static !important; }
}
</style>
