<script setup lang="ts">
const { isDark, toggle } = useTheme()
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

const ariaLabel = computed(() => {
  /* v8 ignore next 2 */
  if (!mounted.value) return 'Theme toggle'
  return isDark.value ? 'Switch to light mode' : 'Switch to dark mode'
})

const titleLabel = computed(() => {
  /* v8 ignore next 2 */
  if (!mounted.value) return 'Theme mode'
  return isDark.value ? 'Light mode' : 'Dark mode'
})
</script>

<template>
  <button
    type="button"
    :aria-label="ariaLabel"
    :title="titleLabel"
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
