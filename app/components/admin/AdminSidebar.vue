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
    class="flex h-screen w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
      <span class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
        KRA <span class="text-blue-600 dark:text-blue-400">Admin</span>
      </span>
    </div>

    <nav class="flex-1 overflow-y-auto p-4 space-y-1">
      <NuxtLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
        :class="[
          isLinkActive(item.href)
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
        ]"
      >
        <Icon
          :name="item.icon"
          class="h-5 w-5 transition-colors"
          :class="[
            isLinkActive(item.href)
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300'
          ]"
        />
        {{ item.name }}
      </NuxtLink>
    </nav>

    <div class="border-t border-slate-200 p-4 dark:border-slate-800">
      <div class="flex items-center gap-3 px-2 text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
        System Status: <span class="text-green-500">Online</span> <!-- TODO: Add logic to check system status -->
      </div>
    </div>
  </aside>
</template>
