<template>
  <div class="proj-row animate-pulse pointer-events-none">
    <div class="num">
      <div class="w-6 h-3 bg-[var(--hairline-strong)] rounded" />
    </div>

    <div class="name">
      <div class="w-40 h-8 bg-[var(--hairline-strong)] rounded" />
    </div>

    <div class="desc">
      <div class="w-full h-3.5 bg-[var(--hairline)] rounded mb-1.5" />
      <div class="w-2/3 h-3.5 bg-[var(--hairline)] rounded" />
    </div>

    <div class="tags">
      <div v-for="i in 2" :key="i" class="w-12 h-4 bg-[var(--hairline-strong)] rounded" />
    </div>

    <div class="cta">
      <div class="w-12 h-3 bg-[var(--hairline-strong)] rounded opacity-60" />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.proj-row {
  border-bottom: 1px solid var(--hairline);
}
</style>
