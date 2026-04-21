<script setup lang="ts">
import { useGsapNavAnimation } from '~/composables/useGsapAnimations'

useGsapNavAnimation()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <header
      class="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center justify-between">
          <NuxtLink
            to="/"
            class="text-lg font-semibold tracking-tight text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
          >
            KRA
          </NuxtLink>
          <div class="sm:hidden">
            <ThemeToggle />
          </div>
        </div>
        <div class="flex items-center gap-4 overflow-x-auto pb-2 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav class="flex items-center gap-5 text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
            <NuxtLink
              to="/"
              class="hover:text-slate-900 dark:hover:text-slate-100"
            >
              Home
            </NuxtLink>
            <NuxtLink
              to="/projects"
              class="hover:text-slate-900 dark:hover:text-slate-100"
            >
              Projects
            </NuxtLink>
            <NuxtLink
              to="/blog"
              class="hover:text-slate-900 dark:hover:text-slate-100"
            >
              Blog
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="hover:text-slate-900 dark:hover:text-slate-100"
            >
              Contact
            </NuxtLink>
            <NuxtLink
              to="/cv"
              class="hover:text-slate-900 dark:hover:text-slate-100"
            >
              CV
            </NuxtLink>
          </nav>
          <div class="hidden sm:block pl-2 border-l border-slate-200 dark:border-slate-700">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
    <main class="mx-auto w-full max-w-5xl flex-grow px-4 py-8">
      <slot />
    </main>
    <footer class="border-t border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900">
      <AppFooterSocials />
    </footer>
  </div>
</template>
