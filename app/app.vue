<script setup lang="ts">
const { init } = useTheme()

useHead({
  bodyAttrs: {
    class: 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 antialiased'
  },
  script: [
    {
      innerHTML: `(function(){var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t!=='light'&&d)){document.documentElement.classList.add('dark')}})()`,
      tagPosition: 'head',
    }
  ]
})

onMounted(() => {
  init()
})
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.page-enter-from {
  opacity: 0;
}

.page-leave-to {
  opacity: 0;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
</style>
