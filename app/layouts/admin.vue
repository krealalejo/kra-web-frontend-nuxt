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
  <div class="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <!-- Fixed Sidebar -->
    <AdminSidebar class="hidden md:flex flex-shrink-0" />

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col min-w-0 overflow-hidden">
      <header
        class="sticky top-0 z-40 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center justify-between">
          <!-- Mobile menu toggle placeholder (optional) -->
          <div class="flex md:hidden">
            <span class="text-base font-semibold text-slate-900 dark:text-slate-100">KRA Admin</span>
          </div>

          <div class="flex flex-1 items-center justify-end gap-4">
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

      <main class="flex-1 overflow-y-auto p-6 md:p-8">
        <div class="mx-auto max-w-5xl">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
