<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})
</script>

<template>
  <div>
    <AdminProjectsSection />
  </div>
</template>
