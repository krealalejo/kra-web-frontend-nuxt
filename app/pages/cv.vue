<script setup lang="ts">
import gsap from 'gsap'
import { format } from 'date-fns'

const currentYear = format(new Date(), 'yyyy')

useSeoMeta({
  title: 'CV · Kevin Real Alejo',
  description: 'Résumé — full-stack engineer specialising in Spring Boot, AWS, and Nuxt.',
  ogTitle: 'CV · Kevin Real Alejo',
  ogDescription: 'Experience, skills, and education of Kevin Real Alejo, full-stack engineer.'
})

const config = useRuntimeConfig()

const { data: profileData } = useAsyncData(
  'cv-profile',
  async () => {
    const apiBase = (config.public.apiBase as string).replace(/\/$/, '')
    if (!apiBase) return null
    try {
      return await $fetch<{ homePortraitUrl: string | null; cvPortraitUrl: string | null; cvPdfUrl: string | null }>(
        `${apiBase}/config/profile`
      )
    } catch {
      return null
    }
  },
  { lazy: true }
)

const cvPdfDownloadUrl = computed(() => {
  const key = profileData.value?.cvPdfUrl
  if (!key) return null
  return `${(config.public.s3PublicBucketUrl as string).replace(/\/$/, '')}/${key}`
})

interface ExperienceEntry {
  id: string; title: string; company: string; location: string
  years: string; description: string; sortOrder: number
}
interface EducationEntry {
  id: string; title: string; institution: string; location: string
  years: string; description: string; sortOrder: number
}
interface SkillCategory {
  id: string; name: string; skills: string[]; sortOrder: number
}

const { data: experienceData } = useAsyncData(
  'cv-experience',
  async () => {
    const apiBase = (config.public.apiBase as string).replace(/\/$/, '')
    if (!apiBase) return [] as ExperienceEntry[]
    try {
      return await $fetch<ExperienceEntry[]>(`${apiBase}/cv/experience`)
    } catch {
      return [] as ExperienceEntry[]
    }
  },
  { lazy: true }
)

const { data: educationData } = useAsyncData(
  'cv-education',
  async () => {
    const apiBase = (config.public.apiBase as string).replace(/\/$/, '')
    if (!apiBase) return [] as EducationEntry[]
    try {
      return await $fetch<EducationEntry[]>(`${apiBase}/cv/education`)
    } catch {
      return [] as EducationEntry[]
    }
  },
  { lazy: true }
)

const { data: skillsData } = useAsyncData(
  'cv-skills',
  async () => {
    const apiBase = (config.public.apiBase as string).replace(/\/$/, '')
    if (!apiBase) return [] as SkillCategory[]
    try {
      return await $fetch<SkillCategory[]>(`${apiBase}/cv/skills/categories`)
    } catch {
      return [] as SkillCategory[]
    }
  },
  { lazy: true }
)

const { getThumbUrl } = useS3()
const cvPortraitThumbUrl = computed(() => getThumbUrl(profileData.value?.cvPortraitUrl))

onMounted(() => {
  gsap.fromTo('.cv-head h1',  { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
  gsap.fromTo('.cv-head .role', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.2 })
  gsap.fromTo('.cv-head .actions', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.35 })
  gsap.fromTo('.cv-section', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.4, stagger: 0.1 })
})
</script>

<template>
  <div class="shell cv-wrap">
    <div class="cv-head">
      <div class="cv-head-main">
        <h1>Kevin Real <br><em style="color:var(--accent);font-style:normal">Alejo</em></h1>
        <div class="role">Full-stack engineer · Barcelona, ES</div>
        <div class="actions">
          <NuxtLink to="/contact" class="btn">Contact me</NuxtLink>
          <a href="https://github.com/krealalejo" target="_blank" rel="noopener" class="btn btn-ghost">GitHub ↗</a>
          <a v-if="cvPdfDownloadUrl" :href="cvPdfDownloadUrl" download class="btn btn-ghost">Download CV ↓</a>
        </div>
      </div>
      <div class="cv-photo-wrap">
        <div class="hero-portrait" style="aspect-ratio:3/4;">
          <span class="corner tl" /><span class="corner tr" />
          <span class="corner bl" /><span class="corner br" />
          <img
            v-if="cvPortraitThumbUrl"
            :src="cvPortraitThumbUrl"
            alt="Kevin Real Alejo"
            style="width:100%;height:100%;object-fit:cover;display:block;"
          />
          <div v-else class="ph-center">
            <svg width="36" height="36" viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.2">
              <circle cx="22" cy="17" r="7" />
              <path d="M8 38c2-7 8-10 14-10s12 3 14 10" />
            </svg>
            <span>portrait.jpg</span>
          </div>
        </div>
        <div class="hero-portrait-meta">
          <span>Fig. 01 · self</span>
          <span>Barcelona · {{ currentYear }}</span>
        </div>
      </div>
    </div>

    <section class="cv-section">
      <div class="title">Summary</div>
      <div>
        <p>Full-stack engineer focused on building robust, scalable systems that pair the power of the Java / Spring ecosystem with modern SSR frontends in Nuxt. Firm believer in Clean Architecture and Domain-Driven Design. My goal: turn complex problems into elegant solutions, optimised for the cloud with AWS and wired together through Terraform.</p>
      </div>
    </section>

    <section v-if="experienceData?.length" class="cv-section">
      <div class="title">Experience</div>
      <div>
        <div v-for="exp in experienceData" :key="exp.id" class="role-row">
          <div>
            <div class="rt">{{ exp.title }} · {{ exp.company }}</div>
            <div class="rc">{{ exp.location }}</div>
            <div class="rd">{{ exp.description }}</div>
          </div>
          <div class="ryears">{{ exp.years }}</div>
        </div>
      </div>
    </section>

    <section v-if="skillsData?.length" class="cv-section">
      <div class="title">Skills</div>
      <div>
        <div v-for="category in skillsData" :key="category.id" class="skill-group">
          <h4>{{ category.name }}</h4>
          <div class="skill-row">
            <span v-for="s in category.skills" :key="s" class="chip">{{ s }}</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="educationData?.length" class="cv-section">
      <div class="title">Education</div>
      <div>
        <div v-for="edu in educationData" :key="edu.id" class="role-row">
          <div>
            <div class="rt">{{ edu.title }}</div>
            <div class="rc">{{ edu.institution }}</div>
            <div class="rd">{{ edu.description }}</div>
          </div>
          <div class="ryears">{{ edu.years }}</div>
        </div>
      </div>
    </section>

    <section class="cv-section">
      <div class="title">Elsewhere</div>
      <div>
        <div style="display:flex;flex-direction:column;gap:12px;font-size:15px;color:var(--fg-dim);">
          <a href="https://github.com/krealalejo" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;transition:color 0.2s" @mouseover="($event.target as HTMLElement).style.color='var(--accent)'" @mouseout="($event.target as HTMLElement).style.color='var(--fg-dim)'">
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);letter-spacing:0.08em;text-transform:uppercase;width:100px;">GitHub</span>
            github.com/krealalejo ↗
          </a>
          <a href="https://www.linkedin.com/in/kevinrealalejo/" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;transition:color 0.2s" @mouseover="($event.target as HTMLElement).style.color='var(--accent)'" @mouseout="($event.target as HTMLElement).style.color='var(--fg-dim)'">
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);letter-spacing:0.08em;text-transform:uppercase;width:100px;">LinkedIn</span>
            linkedin.com/in/kevinrealalejo ↗
          </a>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);letter-spacing:0.08em;text-transform:uppercase;width:100px;">Email</span>
            hi@krealejo.dev
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);letter-spacing:0.08em;text-transform:uppercase;width:100px;">Location</span>
            Barcelona, Spain · UTC+1
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@media (max-width: 700px) {
  .cv-head { grid-template-columns: 1fr !important; }
  .cv-photo-wrap { display: none !important; }
  .cv-section { grid-template-columns: 1fr !important; gap: 16px !important; }
}
</style>
