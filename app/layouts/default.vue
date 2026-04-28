<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'

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

onMounted(() => {
  gsap.from('.kra-nav-logo, .kra-nav-link', {
    opacity: 0, y: -8, duration: 0.5, stagger: 0.04, ease: 'power2.out'
  })
})

watch(isMobileMenuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <div class="min-h-screen relative"> <!-- TODO: FIX THIS -->
    <header class="sticky top-0 z-50 w-full kra-nav">
      <div class="shell kra-nav-inner">
        <NuxtLink to="/" class="kra-nav-logo">
          <span class="dot" />
          <span class="serif">KRA</span>
          <span class="kra-nav-logo-mark">/ Kevin Real Alejo</span>
        </NuxtLink>

        <!-- Desktop nav links -->
        <nav class="kra-nav-links">
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
              <svg v-if="isDark" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
            <template #fallback><span style="width:36px;height:36px;display:inline-block" /></template>
          </ClientOnly>
        </nav>

        <!-- Mobile cluster: theme toggle + hamburger -->
        <div class="nav-mobile-cluster">
          <ClientOnly>
            <button
              class="kra-theme-btn"
              :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              @click="toggle($event)"
            >
              <svg v-if="isDark" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
            <template #fallback><span style="width:36px;height:36px;display:inline-block" /></template>
          </ClientOnly>
          <button
            :class="['nav-burger', { open: isMobileMenuOpen }]"
            :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
            :aria-expanded="isMobileMenuOpen.toString()"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
    
    <!-- Mobile fullscreen sheet -->
    <div :class="['nav-sheet', { open: isMobileMenuOpen }]" :aria-hidden="!isMobileMenuOpen">
      <div class="shell">
        <div class="nav-sheet-header">
          <div class="nav-sheet-overline t-overline">
            <span style="width:24px;height:1px;background:var(--fg-muted);display:inline-block" />
            Menu
          </div>
          <button
            class="nav-sheet-close"
            aria-label="Close menu"
            @click="isMobileMenuOpen = false"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
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
          <span>Madrid · ES</span>
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
          <div>
            <div class="kra-footer-name serif">Kevin Real<br><span style="color:var(--accent)">Alejo</span></div>
            <p class="kra-footer-tag">Full-stack engineer building calm, reliable software on the JVM &amp; modern frontends.</p>
          </div>
          <div class="kra-footer-col">
            <h5>Sitemap</h5>
            <ul>
              <li v-for="item in navItems" :key="item.path">
                <NuxtLink :to="item.path">
                  <span class="arrow">↗</span>{{ item.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div class="kra-footer-col">
            <h5>Elsewhere</h5>
            <ul>
              <li><a href="https://github.com/krealalejo" target="_blank" rel="noopener"><span class="arrow">↗</span>GitHub</a></li>
              <li><a href="https://www.linkedin.com/in/kevinrealalejo/" target="_blank" rel="noopener"><span class="arrow">↗</span>LinkedIn</a></li>
              <li><NuxtLink to="/contact"><span class="arrow">↗</span>hi@krealejo.dev</NuxtLink></li>
            </ul>
          </div>
        </div>
        <div class="kra-footer-bottom">
          <span>© {{ currentYear }} Kevin Real Alejo · All systems operational</span> <!-- TODO: UPDATE LATER WITH REAL STATUS -->
          <span>v3.0 · Barcelona, ES · 40.41°N 3.70°W</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* NuxtLink inside nav-sheet gets the right display */
.nav-sheet-link { display: grid; }
</style>
