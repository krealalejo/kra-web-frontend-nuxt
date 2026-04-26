<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})
</script>

<template>
  <div>
    <AdminActivitySection />
  </div>
</template>
