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
    class="kra-theme-btn"
    @click="toggle($event)"
  >
    <ClientOnly>
      <span class="kra-theme-track">
        <span :class="['kra-theme-dot', { 'is-light': !isDark }]" />
      </span>
      <template #fallback>
        <span style="width:44px;height:24px;display:inline-block" />
      </template>
    </ClientOnly>
  </button>
</template>
