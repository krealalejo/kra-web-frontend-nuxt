import { onMounted } from 'vue'
import gsap from 'gsap'

export function useGsapHeroAnimation() {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const h1 = document.querySelector('h1')
    if (!h1) return

    gsap.from(h1, { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' })
    const p = document.querySelector('h1 + p')
    if (p) {
      gsap.from(p, { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out', delay: 0.15 })
    }
  })
}

export function useGsapCardStagger(selector: string = 'li') {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = document.querySelectorAll(selector)
    if (targets.length === 0) return

    gsap.from(targets, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out', stagger: 0.1 })
  })
}

export function useGsapNavAnimation() {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = document.querySelectorAll('header nav a')
    if (targets.length === 0) return

    gsap.from(targets, { opacity: 0, duration: 0.4, ease: 'power1.out', stagger: 0.05 })
  })
}

export function useGsapContentAnimation() {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const target = document.querySelector('article')
    if (!target) return

    gsap.from(target, { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' })
  })
}
