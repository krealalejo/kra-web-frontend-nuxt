<script setup lang="ts">
definePageMeta({ layout: false })

const { data } = await useFetch('/api/auth/session')
if (data.value?.authenticated) {
  await navigateTo('/admin/quality', { replace: true })
} else {
  await navigateTo('/admin/login', { replace: true })
}
</script>

<template>
  <div />
</template>
