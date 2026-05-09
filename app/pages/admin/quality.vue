<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})
</script>

<template>
  <div class="space-y-12">
    <div class="pb-6" style="border-bottom: 1px solid var(--hairline)">
      <h1 class="t-h2">Code Quality</h1>
      <p class="t-label" style="font-size: 10px; margin-top: 4px">
        Monitoring project health and quality metrics via SonarCloud.
      </p>
    </div>

    <AdminSonarCloudDashboard />

    <AdminCloudWatchDashboard />

    <AdminCacheManager />
  </div>
</template>
