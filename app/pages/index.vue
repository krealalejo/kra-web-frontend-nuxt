<script setup lang="ts">
import type { PortfolioRepoDto } from '~/types/portfolio'
import gsap from 'gsap'
import { useGsapHeroAnimation, useGsapCardStagger } from '~/composables/useGsapAnimations'

const config = useRuntimeConfig()

const { data: projects, pending, error } = await useAsyncData(
  'home-portfolio-repos',
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
useGsapCardStagger('.home-repo-list > li')

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

const isMissingApiBase = computed(() => {
  const msg = error.value && typeof error.value === 'object' && 'message' in error.value
    ? String((error.value as Error).message)
    : error.value ? String(error.value) : ''
  return msg.includes('MISSING_API_BASE')
})
</script>

<template>
  <div>
    <section class="py-10">
      <div class="mx-auto max-w-5xl">
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Project KRA</h1>
        <p class="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
          Portfolio — repositories below are loaded from <strong>GitHub</strong> via the KRA API (SSR).
        </p>
      </div>
    </section>

    <section class="pb-12">
      <div class="mx-auto max-w-5xl px-4">
        <div
          v-if="error"
          class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          <p class="font-medium">
            Could not load repositories
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
            The API did not respond or rejected the request. Ensure Spring Boot is running and that the backend has <code class="rounded bg-red-100 px-1 dark:bg-red-900">github.portfolio-user</code> / token configured if needed.
          </p>
        </div>

        <p v-else-if="pending" class="text-sm text-slate-600 dark:text-slate-400">Loading repositories…</p>

        <ul
          v-else-if="projects && projects.length > 0"
          class="home-repo-list grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <li
            v-for="repo in projects"
            :key="repo.fullName"
          >
            <article
              class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              @mouseenter="handleCardHover"
              @mouseleave="handleCardHoverOut"
            >
              <h2 class="font-semibold text-slate-900 dark:text-slate-100">
                {{ repo.name }}
              </h2>
              <p class="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                {{ repo.description || '—' }}
              </p>
              <p
                v-if="repo.topics?.length"
                class="mt-2 flex flex-wrap gap-1"
              >
                <span
                  v-for="t in repo.topics"
                  :key="t"
                  class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >{{ t }}</span>
              </p>
              <p class="mt-4">
                <NuxtLink
                  :to="`/projects/${repo.owner}/${repo.name}`"
                  class="text-sm font-medium text-slate-900 underline decoration-slate-400 underline-offset-4 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
                >
                  View repository
                </NuxtLink>
              </p>
            </article>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
