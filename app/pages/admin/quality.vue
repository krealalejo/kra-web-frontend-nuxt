<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

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
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Code Quality</h1>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Monitoring project health and quality metrics via SonarCloud.
      </p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="project in projects"
        :key="project.name"
        class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ project.name }}</h2>
          <a
            :href="project.href"
            target="_blank"
            rel="noopener"
            class="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            View Full Report
          </a>
        </div>
        <div class="flex justify-center py-4">
          <img :src="project.badge" :alt="project.name + ' quality gate'" class="h-6" />
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
      <div class="flex gap-3">
        <Icon name="heroicons:information-circle" class="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <p class="text-xs text-blue-700 dark:text-blue-300">
          The quality gate status is updated automatically after every merge to the main branch.
          Click on "View Full Report" to see detailed metrics including coverage, bugs, and vulnerabilities.
        </p>
      </div>
    </div>
  </div>
</template>
