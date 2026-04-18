<script setup lang="ts">
const userCookie = useCookie('kra_user')

const userEmail = computed(() => userCookie.value || 'Admin')

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
    .catch(() => {})
  await navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <header class="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
      <div class="mx-auto flex max-w-5xl items-center justify-between">
        <span class="text-base font-semibold text-slate-900 dark:text-slate-100">KRA Admin</span>
        <div class="flex items-center gap-4">
          <span class="text-sm text-slate-700 dark:text-slate-300">{{ userEmail }}</span>
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
    <main class="mx-auto max-w-5xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
