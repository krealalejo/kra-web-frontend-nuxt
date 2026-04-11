<script setup lang="ts">
definePageMeta({ layout: 'admin' })
// No auth middleware — this is part of the unauthenticated flow
// The server route /api/auth/callback.get.ts handles the actual redirect
// This page is only visible if somehow the SPA renders before the server redirect
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div class="text-center">
      <p class="text-base font-semibold text-slate-900">Verifying login&hellip;</p>
      <p class="mt-2 text-sm text-slate-700">Please wait.</p>
    </div>
  </div>
</template>
