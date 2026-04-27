<script setup lang="ts">
const route = useRoute()

const navigation = [
  { name: 'Blog Posts', href: '/admin', icon: 'heroicons:document-text-20-solid' },
  { name: 'Code Quality', href: '/admin/quality', icon: 'heroicons:chart-bar-20-solid' },
]

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

    <div class="p-6" style="border-top: 1px solid var(--hairline)">
      <div class="flex items-center gap-3 text-[10px] font-medium uppercase tracking-widest" style="color:var(--fg-muted); font-family:var(--font-mono)">
        System: <span style="color:var(--accent); display:flex; align-items:center; gap:6px">
          <span class="w-1.5 h-1.5 rounded-full" style="background:var(--accent); box-shadow:0 0 8px var(--accent)"></span>
          Operational
        </span>
      </div>
    </div>
  </aside>
</template>
