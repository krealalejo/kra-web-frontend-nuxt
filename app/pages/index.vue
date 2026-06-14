<script setup lang="ts">
import type { PortfolioRepoDto } from '~/types/portfolio'
import { useApiError } from '~/composables/useApiError'

const currentYear = new Date().getFullYear().toString()
const isRickRolled = useState('isRickRolled', () => false)
const rickAstleyGif = 'https://media1.tenor.com/m/yheo1GGu3FwAAAAC/rick-roll-rick-ashley.gif'

const config = useRuntimeConfig()

useSeoMeta({
  title: 'Kevin Real Alejo · Full-stack Engineer',
  description: 'Portfolio of Kevin Real Alejo — full-stack engineer specialising in Spring Boot, AWS, and Nuxt.',
  ogTitle: 'Kevin Real Alejo · Full-stack Engineer',
  ogDescription: 'Full-stack engineer specialising in Spring Boot, AWS, and Nuxt. Based in Barcelona.',
})

const { data: projects, error, pending } = useAsyncData(
  'home-portfolio-repos',
  async () => {
    const apiBase = (config.public.apiBase as string).replace(/\/$/, '')
    if (!apiBase) throw new Error('MISSING_API_BASE')
    return await $fetch<PortfolioRepoDto[]>(`${apiBase}/portfolio/repos`)
  },
  { server: false }
)

const { isMissingApiBase } = useApiError(error)

const { data: profileData } = useAsyncData(
  'home-profile',
  async () => {
    const apiBase = (config.public.apiBase as string).replace(/\/$/, '')
    if (!apiBase) return null
    try {
      return await $fetch<{ homePortraitUrl: string | null; cvPortraitUrl: string | null }>(
        `${apiBase}/config/profile`
      )
    } catch {
      return null
    }
  }
)

const { getThumbUrl } = useS3()
const homePortraitThumbUrl = computed(() => {
  if (isRickRolled.value) return rickAstleyGif
  return getThumbUrl(profileData.value?.homePortraitUrl)
})

const s3Origin = computed(() => {
  const url = config.public.s3PublicBucketUrl as string
  if (!url) return null
  try { return new URL(url).origin } catch { return null }
})

useHead(() => {
  const links: Array<Record<string, string>> = []
  if (s3Origin.value) {
    links.push({ rel: 'preconnect', href: s3Origin.value, crossorigin: '' })
  }
  return {
    link: links,
    style: [{
      id: 'hero-init',
      children: `@media (prefers-reduced-motion: no-preference) {
        .display-name, .hero-role, .hero-paragraphs > *, .hero-stack .chip, .hero-portrait { opacity: 0; }
        .display-name { overflow: hidden; }
      }`,
    }],
  }
})

const PAGE_SIZE = 4
const visibleCount = ref(PAGE_SIZE)

const featuredProjects = computed(() => {
  if (!projects?.value) return []
  const featured = projects.value.filter(r => r.topics?.includes('featured'))
  const rest = projects.value.filter(r => !r.topics?.includes('featured'))
  return [...featured, ...rest]
})

const visibleProjects = computed(() => featuredProjects.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < featuredProjects.value.length)

async function loadMore() {
  const prevCount = visibleCount.value
  visibleCount.value += PAGE_SIZE
  await nextTick()
  const { gsap } = await useGsap()
  const rows = document.querySelectorAll<HTMLElement>('.proj-row')
  const newRows = Array.from(rows).slice(prevCount)
  if (newRows.length > 0) {
    gsap.fromTo(newRows, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power2.out' })
  }
}

const oldestProjectYear = computed(() => {
  if (!projects?.value || projects.value.length === 0) return '2025'
  const years = projects.value.filter(p => p.createdAt).map(p => new Date(p.createdAt).getFullYear())
  if (years.length === 0) return '2025'
  const minYear = Math.min(...years)
  return Number.isNaN(minYear) ? '2025' : minYear.toString()
})

const isMounted = ref(false)
const heroRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  isMounted.value = true
  const hero = heroRef.value
  const { gsap } = await useGsap()

  const display = hero?.querySelector('.display-name') as HTMLElement | null
  if (display) {
    const text = display.innerText
    gsap.set(display, { opacity: 1 })
    display.innerHTML = text.split('').map(c =>
      c === ' ' ? `<span class="dl" style="display:inline-block">&nbsp;</span>` : `<span class="dl">${c}</span>`
    ).join('')
    gsap.fromTo('.dl', { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.025, ease: 'power3.out' })
  }

  if (hero) {
    gsap.fromTo('.hero-role',           { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.15, ease: 'power2.out' })
    gsap.fromTo('.hero-paragraphs > *', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.25, stagger: 0.1, ease: 'power2.out' })
    gsap.fromTo('.hero-stack .chip',    { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.4,  stagger: 0.04, ease: 'power2.out' })
    gsap.fromTo('.hero-portrait',       { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 1.0, delay: 0.05, ease: 'power2.out' })
  }

  gsap.utils.toArray<HTMLElement>('.reveal-scroll').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
    )
  })

  try {
    const apiBase = (config.public.apiBase as string).replace(/\/$/, '')
    activityCards.value = await $fetch<Array<{ type: string; title: string | null; description: string | null; tags?: string[] | null; url?: string | null }>>(
      `${apiBase}/activity`
    )
  } catch {
  }
})

watch(pending, (isPending) => {
  if (!import.meta.client) return
  if (!isPending) {
    nextTick(async () => {
      const { gsap, ScrollTrigger } = await useGsap()
      const rows = gsap.utils.toArray<HTMLElement>('.proj-row')
      if (rows.length > 0) {
        ScrollTrigger.batch(rows, {
          onEnter: batch => gsap.fromTo(batch,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, overwrite: true }
          ),
          start: 'top 92%',
          once: true
        })
      }
    })
  }
}, { immediate: true })

const activityCards = ref<Array<{ type: string; title: string | null; description: string | null; tags?: string[] | null; url?: string | null }>>([])

function overlineLabel(type: string): string {
  const labels: Record<string, string> = {
    SHIPPING: 'Now shipping',
    READING: 'Currently reading',
    PLAYING: 'Playing with',
  }
  return labels[type] ?? type
}

const stackItems = ['Spring Boot 3', 'Nuxt 4', 'Java 21', 'TypeScript', 'AWS', 'Terraform', 'DynamoDB', 'GSAP', 'DDD']
const marqueeItems = ['Clean Architecture', 'Domain-Driven Design', 'Java · Spring Boot', 'AWS · Terraform', 'Nuxt · Vue 3', 'Event-driven systems', 'Infrastructure as Code']

function projectNum(i: number) {
  return String(i + 1).padStart(2, '0')
}
</script>

<template>
  <div ref="heroRef" class="main-page">
    <ClientOnly><AppKonamiListener /></ClientOnly>
    <section class="hero-section">
      <div class="shell">
        <div class="hero-grid">
          <div class="hero-left">
            <h1 class="t-display display-name" style="margin-bottom:28px;opacity:0;">Kevin Real Alejo</h1>
            <div class="hero-role">
              <span class="emph">Full-stack engineer</span> — shipping calm,<br> reliable software for the cloud.
            </div>
            <div class="hero-paragraphs">
              <p class="t-body-lg">
                Specialising in robust, scalable systems that pair the power of the Java / Spring ecosystem with the agility of modern SSR frontends in Nuxt.
              </p>
              <p class="t-body-lg">
                Firm believer in <em>Clean Architecture</em> and Domain-Driven Design. My goal: turn complex problems into elegant solutions, optimised for the cloud with AWS and wired together through Terraform.
              </p>
            </div>
            <div class="hero-stack">
              <span v-for="t in stackItems" :key="t" class="chip">{{ t }}</span>
            </div>
          </div>

          <div>
            <div class="hero-portrait">
              <span class="corner tl" /><span class="corner tr" />
              <span class="corner bl" /><span class="corner br" />
              <img
                v-if="homePortraitThumbUrl"
                :src="homePortraitThumbUrl"
                alt="Kevin Real Alejo"
                fetchpriority="high"
                width="600"
                height="800"
                style="width:100%;height:100%;object-fit:cover;display:block;"
              />
              <div v-else class="ph-center">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.2">
                  <circle cx="22" cy="17" r="7" />
                  <path d="M8 38c2-7 8-10 14-10s12 3 14 10" />
                </svg>
                <span>portrait.jpg</span>
                <span style="opacity:0.6">drop your photo here</span>
              </div>
            </div>
            <div class="hero-portrait-meta">
              <span>Fig. 01 · self</span>
              <span>Barcelona · {{ currentYear }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="kra-marquee">
      <div class="kra-marquee-track">
        <span
          v-for="(item, i) in [...marqueeItems, ...marqueeItems]"
          :key="i"
          class="kra-marquee-item"
        >{{ item }}</span>
      </div>
    </div>

    <section class="kra-section">
      <div class="shell">
        <div class="section-head reveal-scroll">
          <span class="num">Work</span>
          <h2>Selected <em>projects</em></h2>
          <span class="sub">{{ oldestProjectYear }} → Present</span>
        </div>

        <div class="proj-list">
          <template v-if="!isMounted || pending">
            <SkeletonProjectRow v-for="i in 4" :key="i" />
          </template>
          <template v-else>
            <NuxtLink
              v-for="(repo, i) in visibleProjects"
              :key="repo.fullName"
              :to="`/projects/${repo.owner}/${repo.name}`"
              class="proj-row"
            >
              <span class="num">{{ projectNum(i) }}</span>
              <span class="name">{{ repo.name }}</span>
              <p class="desc">{{ repo.description || '—' }}</p>
              <div class="tags">
                <span v-for="t in (repo.topics || []).slice(0, 3)" :key="t" class="tag">{{ t }}</span>
              </div>
              <span class="cta">
                View
                <svg class="arrow-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M2 10L10 2M10 2H4M10 2v6"/>
                </svg>
              </span>
            </NuxtLink>
          </template>
        </div>

        <div v-if="error" role="alert" style="padding:32px 16px;color:var(--fg-muted);font-family:var(--font-mono);font-size:12px;letter-spacing:0.08em;">
          <span v-if="isMissingApiBase">API unavailable — set NUXT_PUBLIC_API_BASE_URL to load projects.</span>
          <span v-else>Oops! API failed to load.</span>
        </div>

        <div v-if="hasMore && !pending && isMounted" style="margin-top:24px;display:flex;justify-content:center;">
          <button class="btn btn-ghost load-more-btn" @click="loadMore">
            Load more
            <svg class="icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M7 2v10M2 7l5 5 5-5"/>
            </svg>
          </button>
        </div>

        <div style="margin-top:24px;display:flex;justify-content:space-between;align-items:center;" class="reveal-scroll">
          <span class="t-label">{{ visibleProjects.length }}{{ featuredProjects.length > visibleProjects.length ? ` / ${featuredProjects.length}` : '' }} shown</span>
          <NuxtLink to="/projects" class="btn btn-ghost">
            All projects
            <svg class="icon" width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 10L10 2M10 2H4M10 2v6"/>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="kra-section" style="padding-top:40px;">
      <div class="shell">
        <div class="section-head reveal-scroll">
          <span class="num">Signal</span>
          <h2>Github <em>activity</em></h2>
          <span class="sub">Live from GitHub API</span>
        </div>
        <div class="activity-layout reveal-scroll">
          <AppGithubContributions />
          <div class="activity-list">
            <template v-for="card in activityCards" :key="card.type">
              <div
                v-if="card.type !== 'PLAYING'
                  ? (card.title || card.description)
                  : (card.tags && card.tags.length)"
                class="activity-card"
              >
                <div class="t-overline" style="margin-bottom:14px;">{{ overlineLabel(card.type) }}</div>
                <template v-if="card.type !== 'PLAYING'">
                  <a
                    v-if="card.url"
                    :href="card.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="activity-card-link"
                    style="font-family:var(--font-display);font-size:24px;letter-spacing:-0.02em;margin-bottom:8px;font-weight:500;display:inline-block;color:inherit;text-decoration:none;"
                  >{{ card.title }}</a>
                  <div v-else style="font-family:var(--font-display);font-size:24px;letter-spacing:-0.02em;margin-bottom:8px;font-weight:500;">{{ card.title }}</div>
                  <div style="font-size:13px;color:var(--fg-muted);">{{ card.description }}</div>
                </template>
                <template v-else>
                  <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <span v-for="t in card.tags" :key="t" class="chip">{{ t }}</span>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
:deep(.display-name .dl) {
  display: inline-block;
}

.activity-layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 40px;
  align-items: stretch;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.load-more-btn {
  min-width: 140px;
  gap: 8px;
}

.activity-card-link {
  transition: color 0.2s ease;
}

.activity-card-link:hover {
  color: var(--accent) !important;
}

@media (max-width: 1000px) {
  .activity-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
