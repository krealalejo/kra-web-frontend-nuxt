<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { format } from 'date-fns'

const { isDark, toggle } = useTheme()
const isMobileMenuOpen = ref(false)
const route = useRoute()

const currentYear = format(new Date(), 'yyyy')

watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/projects', label: 'Projects' },
  { path: '/blog', label: 'Blog' },
  { path: '/contact', label: 'Contact' },
  { path: '/cv', label: 'CV' },
]

onMounted(async () => {
  const { gsap } = await useGsap()

  gsap.fromTo('.kra-nav-logo, .kra-nav-link',
    { opacity: 0, y: -8 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out' }
  )
})

watch(isMobileMenuOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
  }
})
</script>

<template>
  <div class="min-h-screen relative">
    <header :class="['sticky top-0 z-50 w-full kra-nav', { '!fixed': isMobileMenuOpen }]">
      <div class="shell kra-nav-inner">
        <NuxtLink to="/" class="kra-nav-logo">
          <span class="dot" />
          <span class="serif">KRA</span>
          <span class="kra-nav-logo-mark">/ Kevin Real Alejo</span>
        </NuxtLink>

        
        <nav class="kra-nav-links" aria-label="Main navigation">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="kra-nav-link"
          >
            {{ item.label }}
          </NuxtLink>

          <ClientOnly>
            <button
              class="kra-theme-btn"
              :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              @click="toggle($event)"
            >
              <span class="kra-theme-track">
                <span :class="['kra-theme-dot', { 'is-light': !isDark }]" />
              </span>
            </button>
            <!-- v8 ignore next 1 -->
            <template #fallback><span style="width:44px;height:24px;display:inline-block" /></template>
          </ClientOnly>
        </nav>


        <div class="nav-mobile-cluster">
          <ClientOnly>
            <button
              class="kra-theme-btn"
              :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              @click="toggle($event)"
            >
              <span class="kra-theme-track">
                <span :class="['kra-theme-dot', { 'is-light': !isDark }]" />
              </span>
            </button>
            <!-- v8 ignore next 1 -->
            <template #fallback><span style="width:44px;height:24px;display:inline-block" /></template>
          </ClientOnly>
          <button
            :class="['nav-burger', { open: isMobileMenuOpen }]"
            :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
            :aria-expanded="isMobileMenuOpen"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <span /><span />
          </button>
        </div>
      </div>
    </header>
    
    
    <div :class="['nav-sheet', { open: isMobileMenuOpen }]" :aria-hidden="!isMobileMenuOpen" @touchmove.prevent>
      <div class="shell">
        <div class="nav-sheet-header">
          <div class="nav-sheet-overline t-overline">
            <span style="width:24px;height:1px;background:var(--fg-muted);display:inline-block" />
            Menu
          </div>
        </div>
        <div class="nav-sheet-list">
          <NuxtLink
            v-for="(item, i) in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-sheet-link"
            :style="{ '--i': i }"
          >
            <span class="num">§0{{ i + 1 }}</span>
            <span class="label">{{ item.label }}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="arrow"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </NuxtLink>
        </div>
        <div class="nav-sheet-foot t-label">
          <span>Barcelona · ES</span>
          <span>hi@krealejo.dev</span>
        </div>
      </div>
    </div>

    <main>
      <slot />
    </main>

    <footer class="kra-footer">
      <div class="shell">
        <div class="kra-footer-grid">
          <div class="kra-footer-brand">
            <div class="kra-footer-name serif">Kevin Real <span class="kra-footer-name-accent">Alejo</span></div>
            <a href="mailto:hi@krealejo.dev" class="kra-footer-email">hi@krealejo.dev</a>
          </div>
          <nav class="kra-footer-nav" aria-label="Footer navigation">
            <NuxtLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="kra-footer-nav-link"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
          <div class="kra-footer-socials-wrap">
            <AppFooterSocials />
          </div>
        </div>
        <div class="kra-footer-bottom">
          <span>© {{ currentYear }} Kevin Real Alejo · Barcelona, ES</span>
          <span class="kra-footer-status">
            <span class="kra-status-dot" aria-hidden="true" />All systems operational
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.nav-sheet-link { display: grid; }
</style>
