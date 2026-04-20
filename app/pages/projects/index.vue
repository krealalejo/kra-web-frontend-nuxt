<script setup lang="ts">
import type { PortfolioRepoDto } from '~/types/portfolio'
import gsap from 'gsap'
import { useGsapHeroAnimation, useGsapCardStagger } from '~/composables/useGsapAnimations'

const config = useRuntimeConfig()

const { data: projects, pending, error } = await useAsyncData(
  'all-portfolio-repos',
  async () => {
    const raw = config.public.apiBase
    const apiBase = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
    if (!apiBase) {
      throw new Error('MISSING_API_BASE')
    }
    return await $fetch<PortfolioRepoDto[]>(`${apiBase}/portfolio/repos`)
  }
)

useGsapHeroAnimation()
useGsapCardStagger('.projects-repo-list > li')

function handleCardHover(e: MouseEvent) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  gsap.to(e.currentTarget, {
    y: -4,
    duration: 0.3,
    ease: 'power1.out'
  })
}

function handleCardHoverOut(e: MouseEvent) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  gsap.to(e.currentTarget, {
    y: 0,
    duration: 0.3,
    ease: 'power1.out'
  })
}

useHead({
  title: 'Projects | Kevin Real Alejo',
  meta: [
    { name: 'description', content: 'Explore all my software development and architecture projects.' }
  ]
})
</script>

<template>
  <div class="projects-page">
    <header class="mb-12">
      <h1 class="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
        All my projects
      </h1>
      <p class="mt-4 text-xl text-slate-600 dark:text-slate-400">
        A complete collection of the works I have been involved in, from CLI tools to enterprise applications.
      </p>
    </header>

    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
      role="alert"
    >
      <p class="font-bold">Error loading projects</p>
      <p class="mt-2 text-sm">Please try again later or contact me.</p>
    </div>

    <div v-else-if="pending" class="flex items-center justify-center py-20">
      <p class="text-lg text-slate-600 dark:text-slate-400">Loading projects…</p>
    </div>

    <div v-else-if="projects && projects.length > 0">
      <ul class="projects-repo-list grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="repo in projects"
          :key="repo.fullName"
        >
          <article
            class="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            @mouseenter="handleCardHover"
            @mouseleave="handleCardHoverOut"
          >
            <div class="flex-1">
              <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">
                {{ repo.name }}
              </h3>
              <p class="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {{ repo.description || 'No description available.' }}
              </p>
            </div>
            
            <div class="mt-8 flex items-center justify-between">
              <NuxtLink
                :to="`/projects/${repo.owner}/${repo.name}`"
                class="group/link inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-slate-900 hover:text-slate-600 dark:text-slate-100 dark:hover:text-slate-300"
              >
                View details
                <Icon name="lucide:chevron-right" class="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
              </NuxtLink>
            </div>
          </article>
        </li>
      </ul>
    </div>

    <div v-else class="rounded-lg border border-slate-200 bg-slate-50 p-20 text-center dark:border-slate-800 dark:bg-slate-900/50">
      <p class="text-slate-600 dark:text-slate-400">No projects found.</p>
    </div>
  </div>
</template>

<style scoped>
.projects-page {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
