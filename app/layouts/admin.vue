<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'

const userCookie = useCookie('kra_user')

const isAuthenticated = computed(() => !!userCookie.value)
const userEmail = computed(() => userCookie.value || 'Admin')
const isMobileMenuOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
    .catch(() => {})
  userCookie.value = null
  await navigateTo('/admin/login')
}

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
  <div class="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <AdminSidebar v-if="isAuthenticated" class="hidden md:flex flex-shrink-0" />

    <Transition
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
      :css="false"
    >
      <div v-if="isMobileMenuOpen && isAuthenticated" class="fixed inset-0 z-50 flex md:hidden">
        <div class="mobile-overlay fixed inset-0 bg-slate-900/80 backdrop-blur-sm" @click="isMobileMenuOpen = false"></div>
        <div class="mobile-sidebar relative flex">
          <AdminSidebar @click="isMobileMenuOpen = false" />
        </div>
      </div>
    </Transition>

    <div class="flex flex-1 flex-col min-w-0 overflow-hidden">
      <header
        v-if="isAuthenticated"
        class="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 md:px-6 py-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 md:hidden">
            <button
              @click="isMobileMenuOpen = true"
              class="inline-flex items-center justify-center rounded-md p-2 -ml-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus:outline-none"
            >
              <Icon name="lucide:menu" class="h-6 w-6" />
            </button>
            <span class="text-base font-semibold text-slate-900 dark:text-slate-100">KRA Admin</span>
          </div>

          <div class="flex flex-1 items-center justify-end gap-3 md:gap-4">
            <span class="hidden sm:inline text-sm text-slate-700 dark:text-slate-300">{{ userEmail }}</span>
            <ThemeToggle />
            <button
              type="button"
              class="rounded px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 dark:text-red-400 dark:hover:bg-red-950"
              @click="logout"
            >
              Logout
            </button>
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
