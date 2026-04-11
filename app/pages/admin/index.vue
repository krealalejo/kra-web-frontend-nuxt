<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})
</script>

<template>
  <div>
    <h1 class="mb-4 text-xl font-semibold text-slate-900">Dashboard</h1>
    <p class="text-sm text-slate-700">
      Welcome to the admin panel. Blog post management coming in Phase 14.
    </p>
  </div>
</template>
