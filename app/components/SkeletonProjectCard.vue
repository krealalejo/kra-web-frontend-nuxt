<template>
  <div class="proj-card animate-pulse pointer-events-none">
    <div class="visual">
      <div class="w-16 h-16 bg-[var(--hairline-strong)] rounded-full opacity-20" />
    </div>

    <div class="cap">
      <div class="w-24 h-3 bg-[var(--hairline-strong)] rounded" />
      <div class="w-12 h-3 bg-[var(--hairline-strong)] rounded" />
    </div>

    <div class="w-2/3 h-9 bg-[var(--hairline-strong)] rounded mb-4" />

    <div class="flex-1">
      <div class="w-full h-3.5 bg-[var(--hairline)] rounded mb-2" />
      <div class="w-4/5 h-3.5 bg-[var(--hairline)] rounded mb-6" />
    </div>

    <div class="flex gap-2 mb-6">
      <div v-for="i in 3" :key="i" class="w-12 h-5 bg-[var(--hairline-strong)] rounded-full" />
    </div>

    <div class="foot">
      <div class="meta">
        <div class="w-12 h-3 bg-[var(--hairline-strong)] rounded" />
        <div class="w-14 h-3 bg-[var(--hairline-strong)] rounded" />
      </div>
      <div class="w-20 h-3 bg-[var(--hairline-strong)] rounded opacity-60" />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.proj-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
