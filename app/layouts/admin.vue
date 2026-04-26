<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'

const userCookie = useCookie('kra_user')

const isAuthenticated = computed(() => !!userCookie.value)
const isMobileMenuOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})

const onBeforeEnter = (el: Element) => {
  const sidebar = el.querySelector('.mobile-sidebar')
  const overlay = el.querySelector('.mobile-overlay')
  if (sidebar) gsap.set(sidebar, { x: '-100%' })
  if (overlay) gsap.set(overlay, { opacity: 0 })
}

const onEnter = (el: Element, done: () => void) => {
  const sidebar = el.querySelector('.mobile-sidebar')
  const overlay = el.querySelector('.mobile-overlay')
  
  if (overlay) {
    gsap.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' })
  }
  if (sidebar) {
    gsap.to(sidebar, { x: '0%', duration: 0.3, ease: 'power2.out', onComplete: done })
  } else {
    done()
  }
}

const onLeave = (el: Element, done: () => void) => {
  const sidebar = el.querySelector('.mobile-sidebar')
  const overlay = el.querySelector('.mobile-overlay')
  
  if (overlay) {
    gsap.to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.in' })
  }
  if (sidebar) {
    gsap.to(sidebar, { x: '-100%', duration: 0.3, ease: 'power2.in', onComplete: done })
  } else {
    done()
  }
}
</script>

<template>
  <div class="flex h-screen overflow-hidden font-sans" style="background:var(--bg); color:var(--fg)">
    <AdminSidebar v-if="isAuthenticated" class="hidden md:flex flex-shrink-0" />

    <Transition
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
      :css="false"
    >
      <div v-if="isMobileMenuOpen && isAuthenticated" class="fixed inset-0 z-50 flex md:hidden">
        <div class="mobile-overlay fixed inset-0 backdrop-blur-sm" style="background:color-mix(in srgb, var(--bg) 80%, transparent)" @click="isMobileMenuOpen = false"></div>
        <div class="mobile-sidebar relative flex">
          <AdminSidebar @click="isMobileMenuOpen = false" />
        </div>
      </div>
    </Transition>

    <div class="flex flex-1 flex-col min-w-0 overflow-hidden">
      <header
        class="sticky top-0 z-40 px-4 md:px-6 py-4"
        style="backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); background:color-mix(in srgb, var(--bg) 80%, transparent); border-bottom: 1px solid var(--hairline)"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              v-if="isAuthenticated"
              @click="isMobileMenuOpen = true"
              class="inline-flex items-center justify-center rounded-md p-2 -ml-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus:outline-none md:hidden"
            >
              <Icon name="lucide:menu" class="h-6 w-6" />
            </button>
            <NuxtLink to="/admin" class="flex items-center gap-2">
              <span class="text-base font-semibold" style="font-family:var(--font-display); letter-spacing:-0.01em">KRA Admin</span>
            </NuxtLink>
          </div>

          <div class="flex items-center gap-3 md:gap-4">
            <ThemeToggle />
            <template v-if="!isAuthenticated">
              <NuxtLink
                to="/"
                class="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Back to site
              </NuxtLink>
            </template>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="mx-auto max-w-5xl">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
