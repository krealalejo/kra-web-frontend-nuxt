<script setup lang="ts">
const route = useRoute()

const userCookie = useCookie('kra_user')
const userEmail = computed(() => userCookie.value || 'Admin')

const navigation = [
  { name: 'Profile', href: '/admin/profile', icon: 'heroicons:user-circle-20-solid' },
  { name: 'Activity', href: '/admin/activity', icon: 'heroicons:signal-20-solid' },
  { name: 'Blog Posts', href: '/admin', icon: 'heroicons:document-text-20-solid' },
  { name: 'Code Quality', href: '/admin/quality', icon: 'heroicons:chart-bar-20-solid' },
]

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
    .catch(() => {})
  userCookie.value = null
  await navigateTo('/admin/login')
}

function isLinkActive(href: string) {
  if (href === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(href)
}
</script>

<template>
  <aside
    class="flex h-screen w-64 flex-col"
    style="background:var(--bg-elev); border-right: 1px solid var(--hairline)"
  >
    <div class="flex h-16 items-center px-6" style="border-bottom: 1px solid var(--hairline)">
      <div class="kra-nav-logo" style="font-size: 18px">
        <div class="dot"></div>
        <span>KRA <span style="color:var(--accent)">Admin</span></span>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto p-4 space-y-1">
      <NuxtLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        class="group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200"
        :style="isLinkActive(item.href) 
          ? { background: 'var(--overlay)', color: 'var(--fg)', boxShadow: 'inset 0 0 0 1px var(--hairline)' } 
          : { color: 'var(--fg-dim)' }"
      >
        <Icon
          :name="item.icon"
          class="h-5 w-5 transition-colors"
          :style="isLinkActive(item.href) ? { color: 'var(--accent)' } : { color: 'var(--fg-faint)' }"
        />
        {{ item.name }}
      </NuxtLink>
    </nav>

    <!-- User Profile Section -->
    <div class="p-4 space-y-4" style="border-top: 1px solid var(--hairline)">
      <div class="flex items-center gap-3 px-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--bg)] font-bold text-xs">
          {{ userEmail.charAt(0).toUpperCase() }}
        </div>
        <div class="flex flex-1 flex-col min-w-0">
          <span class="truncate text-xs font-medium" style="color:var(--fg)">{{ userEmail }}</span>
          <span class="text-[9px] uppercase tracking-tighter" style="color:var(--fg-muted); font-family:var(--font-mono)">Administrator</span>
        </div>
      </div>

      <button
        @click="logout"
        class="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 hover:bg-[var(--overlay)]"
        style="color: #ff4d4d"
      >
        <Icon name="heroicons:arrow-left-on-rectangle-20-solid" class="h-4 w-4" />
        Logout
      </button>

      <div class="flex items-center gap-3 px-2 text-[9px] font-medium uppercase tracking-widest" style="color:var(--fg-muted); font-family:var(--font-mono)">
        System: <span style="color:var(--accent); display:flex; align-items:center; gap:6px">
          <span class="w-1.5 h-1.5 rounded-full" style="background:var(--accent); box-shadow:0 0 8px var(--accent)"></span>
          Operational
        </span>
      </div>
    </div>
  </aside>
</template>
