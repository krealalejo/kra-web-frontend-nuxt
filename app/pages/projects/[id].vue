<script setup lang="ts">
import type { ProjectDto } from '~/types/project'

const route = useRoute()
const config = useRuntimeConfig()

const projectId = computed(() => {
  const p = route.params.id
  return String(Array.isArray(p) ? (p[0] ?? '') : (p ?? ''))
})

const { data: project, pending, error } = await useAsyncData(
  () => `project-detail-${projectId.value}`,
  async () => {
    const id = projectId.value
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid project id' })
    }
    const raw = config.public.apiBase
    const apiBase = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
    if (!apiBase) {
      throw new Error('MISSING_API_BASE')
    }
    try {
      return await $fetch<ProjectDto>(`${apiBase}/projects/${id}`)
    } catch (e: unknown) {
      const err = e as { statusCode?: number; status?: number; response?: { status?: number } }
      const code = err?.statusCode ?? err?.status ?? err?.response?.status
      if (code === 404) {
        throw createError({ statusCode: 404, statusMessage: 'NOT_FOUND' })
      }
      throw e
    }
  },
  { watch: [projectId] }
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
  const d = project.value?.description ?? ''
  if (!d) return 'Portfolio Project KRA'
  return d.length > 160 ? `${d.slice(0, 157)}…` : d
})

useSeoMeta({
  title: computed(() => {
    if (pending.value) return 'Project KRA'
    if (error.value) return 'Project KRA · Proyecto'
    return project.value?.title ?? 'Project KRA'
  }),
  ogTitle: computed(() => {
    if (pending.value) return 'Project KRA'
    if (error.value) return 'Project KRA'
    return project.value?.title ?? 'Project KRA'
  }),
  description: computed(() => {
    if (pending.value) return 'Cargando proyecto…'
    if (error.value) return isNotFound.value ? 'Proyecto no encontrado.' : 'No se pudo cargar el proyecto.'
    return project.value?.description ?? 'Portfolio Project KRA'
  }),
  ogDescription: computed(() => {
    if (pending.value) return 'Cargando proyecto…'
    if (error.value) return isNotFound.value ? 'Proyecto no encontrado.' : 'Error al cargar el proyecto.'
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
      <p>Cargando proyecto…</p>
    </div>

    <div
      v-else-if="error"
      class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
      role="alert"
    >
      <p class="font-medium">
        No se pudo cargar el proyecto
      </p>
      <p
        v-if="isMissingApiBase"
        class="mt-2 text-sm"
      >
        Falta <code class="rounded bg-red-100 px-1">NUXT_PUBLIC_API_BASE_URL</code>. Ver <code class="rounded bg-red-100 px-1">.env.example</code>.
      </p>
      <p
        v-else-if="isNotFound"
        class="mt-2 text-sm"
      >
        Proyecto no encontrado.
      </p>
      <p
        v-else
        class="mt-2 text-sm"
      >
        El servidor no respondió correctamente. Comprueba que el API está en marcha.
      </p>
      <p class="mt-4">
        <NuxtLink
          to="/"
          class="text-sm font-medium text-red-900 underline"
        >
          Volver al inicio
        </NuxtLink>
      </p>
    </div>

    <article v-else-if="project">
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900">
        {{ project.title }}
      </h1>
      <p class="mt-4 text-slate-600">
        {{ project.description }}
      </p>
      <section
        v-if="project.content"
        class="mt-8"
      >
        <h2 class="text-lg font-semibold text-slate-900">
          Contenido
        </h2>
        <p class="mt-2 whitespace-pre-wrap text-slate-600">
          {{ project.content }}
        </p>
      </section>
      <p
        v-if="project.url"
        class="mt-8"
      >
        <a
          :href="project.url"
          class="text-slate-900 underline decoration-slate-400 underline-offset-4 hover:text-slate-700"
          target="_blank"
          rel="noopener noreferrer"
        >Sitio externo</a>
      </p>
    </article>
  </div>
</template>
