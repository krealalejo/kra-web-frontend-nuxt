<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const flushing = ref(false)
const flushResult = ref<{ ok: boolean; message: string } | null>(null)

async function flushCache() {
  flushing.value = true
  flushResult.value = null
  try {
    await $fetch('/api/admin/cache/flush', { method: 'POST' })
    flushResult.value = { ok: true, message: 'Cache flushed successfully.' }
  } catch {
    flushResult.value = { ok: false, message: 'Failed to flush cache.' }
  } finally {
    flushing.value = false
  }
}

const projects = [
  {
    name: 'kra-api',
    href: 'https://sonarcloud.io/summary/new_code?id=krealalejo_kra-api',
    badge: 'https://sonarcloud.io/api/project_badges/measure?project=krealalejo_kra-api&metric=alert_status'
  },
  {
    name: 'kra-web-frontend-nuxt',
    href: 'https://sonarcloud.io/summary/new_code?id=krealalejo_kra-web-frontend-nuxt',
    badge: 'https://sonarcloud.io/api/project_badges/measure?project=krealalejo_kra-web-frontend-nuxt&metric=alert_status'
  },
  {
    name: 'kra-lambdas',
    href: 'https://sonarcloud.io/summary/new_code?id=krealalejo_kra-lambdas',
    badge: 'https://sonarcloud.io/api/project_badges/measure?project=krealalejo_kra-lambdas&metric=alert_status'
  }
]
</script>

<template>
  <div class="space-y-12">
    <div class="pb-6" style="border-bottom: 1px solid var(--hairline)">
      <h1 class="t-h2">Code Quality</h1>
      <p class="t-label" style="font-size: 10px; margin-top: 4px">
        Monitoring project health and quality metrics via SonarCloud.
      </p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="project in projects"
        :key="project.name"
        class="flex flex-col gap-6 rounded-2xl p-6 transition-all hover:translate-y-[-2px]"
        style="background:var(--bg-elev); border: 1px solid var(--hairline)"
      >
        <div class="flex items-center justify-between">
          <h2 class="t-label" style="font-size: 11px; color: var(--fg)">{{ project.name }}</h2>
          <a
            :href="project.href"
            target="_blank"
            rel="noopener"
            class="t-label hover:text-[var(--accent)] transition-colors"
            style="font-size: 10px; cursor: pointer; text-decoration: underline; text-underline-offset: 4px"
          >
            View Report
          </a>
        </div>
        <div class="flex justify-center py-6 rounded-xl" style="background: var(--bg-sunken); border: 1px solid var(--hairline)">
          <img :src="project.badge" :alt="project.name + ' quality gate'" class="h-6" />
        </div>
      </div>
    </div>

    <CloudWatchDashboard />

    <div class="rounded-xl p-6" style="background: var(--overlay); border: 1px solid var(--hairline)">
      <div class="flex gap-4">
        <Icon name="lucide:info" class="h-5 w-5 flex-shrink-0" style="color: var(--accent)" />
        <p class="t-body" style="font-size: 13px; color: var(--fg-muted); max-width: none">
          The quality gate status is updated automatically after every merge to the main branch.
          Click on "View Report" to see detailed metrics including coverage, bugs, and vulnerabilities.
        </p>
      </div>
    </div>

    <div class="rounded-xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline)">
      <div class="flex items-start justify-between gap-6 flex-wrap">
        <div class="flex flex-col gap-1">
          <h2 class="t-label" style="font-size: 12px; color: var(--fg)">API Cache</h2>
          <p class="t-label" style="font-size: 11px; color: var(--fg-muted)">
            Flush all Memcached entries. Useful after manual data corrections.
          </p>
          <p
            v-if="flushResult"
            class="t-label"
            style="font-size: 11px; margin-top: 4px"
            :style="{ color: flushResult.ok ? 'var(--success, #22c55e)' : 'var(--error, #ef4444)' }"
          >
            {{ flushResult.message }}
          </p>
        </div>
        <button
          :disabled="flushing"
          class="t-label rounded-lg px-4 py-2 transition-opacity"
          style="font-size: 11px; background: var(--accent); color: #fff; border: none; cursor: pointer; white-space: nowrap"
          :style="{ opacity: flushing ? '0.6' : '1' }"
          @click="flushCache"
        >
          {{ flushing ? 'Flushing…' : 'Flush Cache' }}
        </button>
      </div>
    </div>
  </div>
</template>
