<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useGsapNavAnimation } from '~/composables/useGsapAnimations'
import gsap from 'gsap'

useGsapNavAnimation()

const isMobileMenuOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})

const onBeforeEnter = (el: Element) => {
  gsap.set(el, { height: 0, opacity: 0 })
}

const onEnter = (el: Element, done: () => void) => {
  gsap.to(el, {
    height: 'auto',
    opacity: 1,
    duration: 0.3,
    ease: 'power2.out',
    onComplete: done
  })
  
  gsap.fromTo(
    el.querySelectorAll('.mobile-nav-link'),
    { y: 15, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
  )
}

const onLeave = (el: Element, done: () => void) => {
  gsap.to(el, {
    height: 0,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in',
    onComplete: done
  })
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-4 dark:border-slate-800 dark:bg-slate-900/80">
      <div class="mx-auto flex max-w-5xl flex-col">
        <div class="flex items-center justify-between">
          <NuxtLink
            to="/"
            class="text-lg font-semibold tracking-tight text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300 z-50"
            @click="isMobileMenuOpen = false"
          >
            KRA
          </NuxtLink>
          
          <div class="hidden sm:flex items-center gap-4">
            <nav class="flex items-center gap-5 text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
              <NuxtLink to="/" class="hover:text-slate-900 dark:hover:text-slate-100">Home</NuxtLink>
              <NuxtLink to="/projects" class="hover:text-slate-900 dark:hover:text-slate-100">Projects</NuxtLink>
              <NuxtLink to="/blog" class="hover:text-slate-900 dark:hover:text-slate-100">Blog</NuxtLink>
              <NuxtLink to="/contact" class="hover:text-slate-900 dark:hover:text-slate-100">Contact</NuxtLink>
              <NuxtLink to="/cv" class="hover:text-slate-900 dark:hover:text-slate-100">CV</NuxtLink>
            </nav>
            <div class="pl-2 border-l border-slate-200 dark:border-slate-700">
              <ThemeToggle />
            </div>
          </div>

          <div class="flex items-center gap-2 sm:hidden z-50">
            <ThemeToggle />
            <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500"
              :aria-expanded="isMobileMenuOpen"
            >
              <span class="sr-only">Open main menu</span>
              <Icon v-if="!isMobileMenuOpen" name="lucide:menu" class="h-6 w-6" aria-hidden="true" />
              <Icon v-else name="lucide:x" class="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        <Transition
          @before-enter="onBeforeEnter"
          @enter="onEnter"
          @leave="onLeave"
        >
          <div v-if="isMobileMenuOpen" class="sm:hidden overflow-hidden">
            <nav class="flex flex-col space-y-2 pt-8 pb-6 px-2">
              <NuxtLink to="/" class="mobile-nav-link block w-full rounded-xl py-3 text-center text-lg font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-slate-100">Home</NuxtLink>
              <NuxtLink to="/projects" class="mobile-nav-link block w-full rounded-xl py-3 text-center text-lg font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-slate-100">Projects</NuxtLink>
              <NuxtLink to="/blog" class="mobile-nav-link block w-full rounded-xl py-3 text-center text-lg font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-slate-100">Blog</NuxtLink>
              <NuxtLink to="/contact" class="mobile-nav-link block w-full rounded-xl py-3 text-center text-lg font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-slate-100">Contact</NuxtLink>
              <NuxtLink to="/cv" class="mobile-nav-link block w-full rounded-xl py-3 text-center text-lg font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-slate-100">CV</NuxtLink>
            </nav>
          </div>
        </Transition>
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
