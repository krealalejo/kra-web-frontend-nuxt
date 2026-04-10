<script setup lang="ts">
import type { ProjectDto } from '~/types/project'

const config = useRuntimeConfig()

const { data: projects, pending, error } = await useAsyncData(
  'home-projects',
  async () => {
    const raw = config.public.apiBase
    const apiBase = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
    if (!apiBase) {
      throw new Error('MISSING_API_BASE')
    }
    return await $fetch<ProjectDto[]>(`${apiBase}/projects?limit=50`)
  }
)
</script>

<template>
  <div>
    <section class="py-10">
      <div class="mx-auto max-w-5xl">
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Project KRA</h1>
        <p class="mt-3 max-w-2xl text-slate-600">
          Portfolio and engineering workspace — projects below are loaded from the Spring Boot API (SSR).
        </p>
      </div>
    </section>

    <section class="pb-12">
      <div class="mx-auto max-w-5xl px-4">
        <p v-if="pending" class="text-sm text-slate-600">Cargando proyectos…</p>

        <ul
          v-else-if="projects && projects.length > 0"
          class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <li
            v-for="project in projects"
            :key="project.id"
          >
            <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 class="font-semibold text-slate-900">
                {{ project.title }}
              </h2>
              <p class="mt-2 line-clamp-3 text-sm text-slate-600">
                {{ project.description }}
              </p>
              <p class="mt-4">
                <NuxtLink
                  :to="`/projects/${project.id}`"
                  class="text-sm font-medium text-slate-900 underline decoration-slate-400 underline-offset-4 hover:text-slate-700"
                >
                  Ver proyecto
                </NuxtLink>
              </p>
            </article>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
