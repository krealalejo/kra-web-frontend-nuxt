<script setup lang="ts">
import type { PortfolioRepoDto } from '~/types/portfolio'
import { useGsapHeroAnimation, useGsapCardStagger, useCardHoverAnimation } from '~/composables/useGsapAnimations'
import { useApiError } from '~/composables/useApiError'

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
const { handleCardHover, handleCardHoverOut } = useCardHoverAnimation()

const { isMissingApiBase } = useApiError(error)

const limitedProjects = computed(() => {
  if (!projects.value) return []
  
  const featured = projects.value.filter(repo => repo.topics?.includes('featured'))
  const others = projects.value.filter(repo => !repo.topics?.includes('featured'))
  
  return [...featured, ...others].slice(0, 3)
})
</script>

<template>
  <div>
    <section class="pb-12 pt-6">
      <div class="mx-auto max-w-6xl px-4">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-10 lg:gap-12">
          <!-- Bio Column (70%) -->
          <div class="lg:col-span-7">
            <h1 class="gsap-hero-item text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
              Kevin Real Alejo
            </h1>
            <p class="gsap-hero-item mt-3 text-lg font-medium text-slate-600 dark:text-slate-400 sm:text-xl">
              Full Stack Engineer · Cloud & Architecture
            </p>
            
            <div class="gsap-hero-item mt-8 space-y-6 text-base text-slate-600 dark:text-slate-400">
              <p>
                Software Engineer specializing in the development of robust and scalable applications. My focus combines the power of the Java/Spring Boot ecosystem with the agility of modern frontends in Nuxt.
              </p>
              <p>
                I am a firm believer in Clean Architecture and Domain-Driven Design (DDD). My goal is to transform complex problems into elegant technical solutions, optimized for the cloud with AWS and automated through infrastructure as code (Terraform).
              </p>
            </div>

            <div class="gsap-hero-item mt-8 flex flex-wrap gap-2">
              <span class="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">Spring Boot</span>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">Nuxt 3</span>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">AWS</span>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">Terraform</span>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">DDD</span>
            </div>

            <!-- GitHub Contributions -->
            <div class="gsap-hero-item mt-6">
              <AppGithubContributions />
            </div>
          </div>

          <!-- Projects Column (30%) -->
          <div class="lg:col-span-3">
            <h2 class="gsap-hero-item text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              MY PROJECTS
            </h2>

            <div
              v-if="error"
              class="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              role="alert"
            >
              <p class="text-sm font-medium">Error loading projects</p>
              <p v-if="isMissingApiBase" class="mt-2 text-xs">
                Set <code class="rounded bg-red-100 px-1 dark:bg-red-900 text-[10px]">NUXT_PUBLIC_API_BASE_URL</code> and restart the dev server.
              </p>
            </div>

            <p v-else-if="pending" class="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading projects…</p>

            <ul
              v-else-if="limitedProjects.length > 0"
              class="home-repo-list mt-4 flex flex-col gap-4"
            >
              <li
                v-for="repo in limitedProjects"
                :key="repo.fullName"
              >
                <article
                  class="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                  @mouseenter="handleCardHover"
                  @mouseleave="handleCardHoverOut"
                >
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">
                    {{ repo.name }}
                  </h3>
                  <p class="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                    {{ repo.description || '—' }}
                  </p>
                  <div class="mt-4 flex items-center justify-between">
                    <NuxtLink
                      :to="`/projects/${repo.owner}/${repo.name}`"
                      class="text-xs font-bold uppercase tracking-tight text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 dark:text-slate-100 dark:decoration-slate-700 dark:hover:decoration-slate-100"
                    >
                      View details
                    </NuxtLink>
                    <div v-if="repo.topics?.length" class="flex gap-1">
                      <span class="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    </div>
                  </div>
                </article>
              </li>
            </ul>

            <div v-if="projects && projects.length > 3" class="mt-8 flex justify-center">
              <NuxtLink
                to="/projects"
                class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                View all projects
                <Icon name="lucide:arrow-right" class="h-4 w-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
