import { onMounted } from 'vue'
import gsap from 'gsap'

export function useGsapHeroAnimation() {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.from('h1', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' })
    gsap.from('h1 + p', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out', delay: 0.15 })
  })
}

export function useGsapCardStagger(selector: string = 'li') {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.from(selector, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out', stagger: 0.1 })
  })
}

export function useGsapNavAnimation() {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.from('nav a', { opacity: 0, duration: 0.4, ease: 'power1.out', stagger: 0.05 })
  })
}
