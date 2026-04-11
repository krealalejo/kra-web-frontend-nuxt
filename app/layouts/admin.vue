<script setup lang="ts">
// Decode id_token JWT payload to get user info (client-side only — no library needed)
const session = useCookie('kra_session')

const userEmail = computed(() => {
  if (!session.value) return ''
  try {
    const payload = session.value.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded.email || decoded['cognito:username'] || 'Admin'
  } catch {
    return 'Admin'
  }
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
    .catch(() => {}) // proceed with navigation even if server errors
  await navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
    <header class="border-b border-slate-200 bg-white px-4 py-4">
      <div class="mx-auto flex max-w-5xl items-center justify-between">
        <span class="text-base font-semibold text-slate-900">KRA Admin</span>
        <div class="flex items-center gap-4">
          <span class="text-sm text-slate-700">{{ userEmail }}</span>
          <button
            type="button"
            class="rounded px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
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
