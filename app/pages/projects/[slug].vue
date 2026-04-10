<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Project: {{ slug }}</h1>
    <p class="mt-4 text-slate-600">
      This page is a placeholder until Phase 10 adds real portfolio content and data fetching.
    </p>
  </div>
</template>
