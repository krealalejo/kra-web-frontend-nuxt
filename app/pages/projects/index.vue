<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import type { PortfolioRepoDto } from '~/types/portfolio'
import { useCardHoverAnimation } from '~/composables/useGsapAnimations'

const config = useRuntimeConfig()
const { gsap } = useGsap()
const filter = ref('all')

const { data: projects, error, pending } = useAsyncData('all-portfolio-repos', async () => {
  const apiBase = (config.public.apiBase as string).replace(/\/$/, '')
  if (!apiBase) throw new Error('MISSING_API_BASE')
  return await $fetch<PortfolioRepoDto[]>(`${apiBase}/portfolio/repos`)
}, { lazy: false })

const frozenProjects = ref<PortfolioRepoDto[]>([])
const isAnimating = ref(false)

const displayProjects = computed(() => {
  if (isAnimating.value) return frozenProjects.value
  return filtered.value
})

const kinds = ['all', 'frontend', 'backend', 'serverless']

const filtered = computed(() => {
  if (!projects?.value) return []
  if (filter.value === 'all') return projects.value
  return projects.value.filter(r => r.kind?.toLowerCase() === filter.value.toLowerCase())
})

function projectGlyph(repo: PortfolioRepoDto) {
  const k = repo.kind?.toLowerCase()
  if (k === 'backend') return 'α'
  if (k === 'frontend') return 'w'
  if (k === 'serverless') return 'λ'
  return repo.name[0]?.toUpperCase() ?? '◇'
}

function projectKind(repo: PortfolioRepoDto) {
  return repo.kind || 'Code'
}

function projectYear(repo: PortfolioRepoDto) {
  return new Date(repo.updatedAt).getFullYear()
}

async function applyFilter(k: string) {
  if (filter.value === k || isAnimating.value) return
  
  isAnimating.value = true
  frozenProjects.value = [...displayProjects.value]
  
  const cards = gsap.utils.toArray('.proj-card')
  if (cards.length > 0) {
    await gsap.to(cards, {
      opacity: 0,
      scale: 0.92,
      y: 15,
      stagger: {
        each: 0.04,
        from: 'start'
      },
      duration: 0.35,
      ease: 'power2.in'
    })
  }

  filter.value = k
  frozenProjects.value = filtered.value
  
  await nextTick()
  
  const newCards = gsap.utils.toArray('.proj-card')
  if (newCards.length > 0) {
    gsap.set(newCards, { opacity: 0, scale: 1.05, y: -15 })
    
    await gsap.to(newCards, {
      opacity: 1,
      scale: 1,
      y: 0,
      stagger: {
        each: 0.07,
        from: 'start'
      },
      duration: 0.6,
      ease: 'back.out(1.2)',
      clearProps: 'all'
    })
  }
  
  isAnimating.value = false
}

onMounted(() => {
  gsap.fromTo('.page-head .overline', { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.6 })
  gsap.fromTo('.page-head h1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.1, ease: 'power3.out' })
  gsap.fromTo('.page-head .kicker', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.3 })
  
  if (gsap.utils.toArray('.proj-card').length > 0) {
    gsap.fromTo('.proj-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.3, stagger: 0.1 })
  }
})

watch(pending, (isPending) => {
  if (!isPending) {
    nextTick(() => {
      if (gsap.utils.toArray('.proj-card').length > 0) {
        gsap.fromTo('.proj-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 })
      }
    })
  }
})

const { handleCardHover, handleCardHoverOut } = useCardHoverAnimation()

useHead({ title: 'Projects · Kevin Real Alejo' })
</script>

<template>
  <div>
    <header class="page-head">
      <div class="shell">
        <div class="overline"><span class="bar" /> §02 — Index of work</div>
        <h1>All my <em>projects</em>.</h1>
        <p class="kicker">A complete archive — from CLI toys to enterprise services. Side projects live here with the same weight as the production ones.</p>

        <div style="display:flex;gap:8px;margin-top:40px;flex-wrap:wrap;align-items:center;">
          <span class="t-label" style="margin-right:12px;">Filter</span>
          <button
            v-for="k in kinds"
            :key="k"
            class="chip"
            style="cursor:pointer;text-transform:capitalize;"
            :style="{
              background: filter === k ? 'var(--fg)' : 'transparent',
              color: filter === k ? 'var(--bg)' : 'var(--fg-dim)',
              borderColor: filter === k ? 'var(--fg)' : 'var(--hairline-strong)',
            }"
            @click="applyFilter(k)"
          >{{ k }}</button>
          <span style="margin-left:auto;" class="t-label">{{ displayProjects.length }} of {{ projects?.length ?? 0 }}</span>
        </div>
      </div>
    </header>

    <section class="shell" style="padding-bottom:80px;">
      <div v-if="error" role="alert" style="color:var(--fg-muted);font-family:var(--font-mono);font-size:12px;padding:40px 0;">
        API unavailable — set NUXT_PUBLIC_API_BASE_URL.
      </div>

      <div v-else-if="pending" class="proj-grid">
        <SkeletonProjectCard v-for="i in 6" :key="i" />
      </div>

      <div v-else-if="!filtered.length" style="color:var(--fg-muted);font-family:var(--font-mono);font-size:12px;padding:40px 0;">
        No projects found.
      </div>

      <div v-else class="proj-grid">
        <NuxtLink
          v-for="(repo, i) in displayProjects"
          :key="repo.fullName"
          :to="`/projects/${repo.owner}/${repo.name}`"
          class="proj-card"
          @mouseenter="handleCardHover"
          @mouseleave="handleCardHoverOut"
        >
          <div class="visual">
            <span class="glyph">{{ projectGlyph(repo) }}</span>
          </div>
          <div class="cap">
            <span>{{ String(i + 1).padStart(2, '0') }} · {{ projectKind(repo) }}</span>
            <span>{{ projectYear(repo) }}</span>
          </div>
          <h3 class="title">{{ repo.name }}</h3>
          <p class="desc">{{ repo.description || '—' }}</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px;">
            <span v-for="t in (repo.topics || []).slice(0, 4)" :key="t" class="chip" style="font-size:10px;">{{ t }}</span>
          </div>
          <div class="foot">
            <div class="meta">
              <span>★ {{ repo.stargazersCount }}</span>
              <span v-if="repo.defaultBranch">⎇ {{ repo.defaultBranch }}</span>
            </div>
            <span class="cta">
              Case study
              <svg class="icon" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M2 10L10 2M10 2H4M10 2v6"/>
              </svg>
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
