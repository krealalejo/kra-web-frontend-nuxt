<script setup lang="ts">
const { init } = useTheme()

useHead({
  bodyAttrs: {
    style: 'margin:0;padding:0;'
  },
  style: [
    {
      innerHTML: `:root{--bg:#1a1a1c;--fg:#ededec;--font-sans:'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;}[data-theme="light"]{--bg:#f6f5f1;--fg:#0b0b0c;}html,body{background:var(--bg);color:var(--fg);font-family:var(--font-sans);}`,
      tagPosition: 'head',
    }
  ],
  script: [
    {
      innerHTML: `(function(){var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=t==='dark'||(t!=='light'&&d);if(dark){document.documentElement.classList.add('dark')}document.documentElement.setAttribute('data-theme',dark?'dark':'light')})()`,
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
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
</style>
