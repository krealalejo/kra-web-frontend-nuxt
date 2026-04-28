<script setup lang="ts">
const { isDark, toggle } = useTheme()
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <button
    type="button"
    :aria-label="mounted ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : 'Theme toggle'"
    :title="mounted ? (isDark ? 'Light mode' : 'Dark mode') : 'Theme mode'"
    class="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
    @click="toggle($event)"
  >
    <ClientOnly>
      <svg
        v-if="isDark"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        />
      </svg>
      <template #fallback>
        <div class="h-5 w-5" />
      </template>
    </ClientOnly>
  </button>
</template>
