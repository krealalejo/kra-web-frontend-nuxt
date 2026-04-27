<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'

const { isDark, toggle } = useTheme()
const isMobileMenuOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/projects', label: 'Projects' },
  { path: '/blog', label: 'Posts' },
  { path: '/contact', label: 'Contact' },
  { path: '/cv', label: 'CV' },
]

const mounted = ref(false)
onMounted(() => {
  mounted.value = true
  gsap.from('.kra-nav-logo, .kra-nav-link', {
    opacity: 0, y: -8, duration: 0.5, stagger: 0.04, ease: 'power2.out'
  })
})

const onBeforeEnter = (el: Element) => {
  gsap.set(el, { height: 0, opacity: 0 })
}
const onEnter = (el: Element, done: () => void) => {
  gsap.to(el, { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out', onComplete: done })
  gsap.fromTo(el.querySelectorAll('.mobile-nav-link'),
    { y: 15, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
  )
}
const onLeave = (el: Element, done: () => void) => {
  gsap.to(el, { height: 0, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: done })
}
</script>

<template>
  <div>
    <nav class="kra-nav">
      <div class="shell kra-nav-inner">
        <NuxtLink to="/" class="kra-nav-logo">
          <span class="dot" />
          <span class="serif">KRA</span>
          <span class="kra-nav-logo-mark">/ Kevin Real Alejo</span>
        </NuxtLink>

        <div class="kra-nav-links">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="kra-nav-link"
            :class="{ 'kra-nav-link--always': true }"
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

          <!-- Mobile hamburger -->
          <button
            class="kra-theme-btn"
            style="display:none"
            :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <svg v-if="!isMobileMenuOpen" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <Transition @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
        <div v-if="isMobileMenuOpen" class="shell" style="overflow:hidden">
          <nav style="display:flex;flex-direction:column;gap:4px;padding:16px 0;">
            <NuxtLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="mobile-nav-link kra-nav-link"
              style="text-align:center;padding:12px 14px;"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>
      </Transition>
    </nav>

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
          <span>© 2026 Kevin Real Alejo · All systems operational</span>
          <span>v3.0 · Madrid, ES · 40.41°N 3.70°W</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  .kra-nav-link { display: none !important; }
  .kra-nav-link:last-of-type { display: none; }
  button[aria-label="Open menu"],
  button[aria-label="Close menu"] { display: inline-flex !important; }
}
</style>
