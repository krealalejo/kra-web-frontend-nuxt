<script setup lang="ts">
useSeoMeta({
  title: 'CV · Kevin Real Alejo · Project KRA',
  description: 'Résumé and background — static content in the Nuxt repo.',
  ogTitle: 'CV · Kevin Real Alejo',
  ogDescription: 'Experience, skills, and education (placeholder content in source).'
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
      Kevin Real Alejo
    </h1>
    <p class="mt-2 text-lg text-slate-600 dark:text-slate-400">
      Full Stack · Cloud &amp; DDD
    </p>

    <section class="mt-10">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Summary
      </h2>
      <p class="mt-3 text-slate-700 dark:text-slate-300">
        Engineer focused on AWS, Spring Boot, and SSR frontends (Nuxt). This CV is
        <strong>static</strong> in the repository — edit this file with your real story.
      </p>
    </section>

    <section class="mt-10">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Experience
      </h2>
      <ul class="mt-3 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
        <li>Sample role — company (years): measurable impact, stack (Java, Nuxt, Terraform).</li>
        <li>Sample role — company (years): technical leadership, CI/CD, observability.</li>
      </ul>
    </section>

    <section class="mt-10">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Skills
      </h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <span class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">TypeScript</span>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">Java / Spring Boot</span>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">AWS</span>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">Terraform</span>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">Nuxt</span>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Education
      </h2>
      <p class="mt-3 text-slate-700 dark:text-slate-300">
        Degree / institution / year (placeholder).
      </p>
    </section>
  </div>
</template>
