<script setup lang="ts">
const { init } = useTheme()

useHead({
  htmlAttrs: {
    lang: 'en',
    'data-theme': 'dark',
  },
  bodyAttrs: {
    style: 'margin:0;padding:0;'
  },
  style: [
    {
      innerHTML: `:root{--bg:#1a1a1c;--fg:#ededec;--font-sans:'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;}[data-theme="light"]{--bg:#f6f5f1;--fg:#0b0b0c;}html,body{background:var(--bg);color:var(--fg);font-family:var(--font-sans);}.page-loader{position:fixed;inset:0;background:var(--bg,#1a1a1c);z-index:9999;pointer-events:none;transition:opacity 0.25s ease;}`,
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

  const loader = document.querySelector<HTMLElement>('.page-loader')
  if (loader) {
    const hide = () => {
      loader.style.opacity = '0'
      loader.addEventListener('transitionend', () => { loader.style.visibility = 'hidden' }, { once: true })
    }
    Promise.race([
      document.fonts.ready,
      new Promise<void>(r => setTimeout(r, 300)),
    ]).then(hide)
  }
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
