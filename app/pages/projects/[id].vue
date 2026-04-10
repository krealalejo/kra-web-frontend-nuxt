<script setup lang="ts">
const route = useRoute()
const id = computed(() => {
  const p = route.params.id
  return String(Array.isArray(p) ? (p[0] ?? '') : (p ?? ''))
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Project: {{ id }}</h1>
    <p class="mt-4 text-slate-600">
      Placeholder — project detail and SEO will load from the API in the next tasks.
    </p>
  </div>
</template>
