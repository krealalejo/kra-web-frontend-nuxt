<template>
  <div class="blog-row animate-pulse pointer-events-none">
    <div class="num">
      <div class="w-8 h-3 bg-[var(--hairline-strong)] rounded" />
    </div>

    <div class="date">
      <div class="w-24 h-3 bg-[var(--hairline-strong)] rounded" />
    </div>

    <div>
      <div class="w-3/4 h-6 bg-[var(--hairline-strong)] rounded mb-3" />
      <div class="w-full h-3 bg-[var(--hairline)] rounded mb-1.5" />
      <div class="w-2/3 h-3 bg-[var(--hairline)] rounded" />
    </div>

    <div style="display:flex;align-items:center;gap:16px;">
      <div class="w-4 h-4 bg-[var(--hairline-strong)] rounded opacity-40" />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.blog-row {
  border-bottom: 1px solid var(--hairline);
}
</style>
