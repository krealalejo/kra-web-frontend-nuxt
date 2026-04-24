import { onMounted } from 'vue'
import gsap from 'gsap'

export function useGsapHeroAnimation() {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (document.querySelectorAll('.gsap-hero-item').length === 0) return
    gsap.from('.gsap-hero-item', { 
      opacity: 0, 
      y: 10, 
      duration: 0.5, 
      ease: 'power2.out', 
      stagger: 0.1 
    })
  })
}

export function useGsapCardStagger(selector: string = 'li') {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (document.querySelectorAll(selector).length === 0) return
    gsap.from(selector, { 
      opacity: 0, 
      y: 10, 
      duration: 0.5, 
      ease: 'power2.out', 
      stagger: 0.1,
      delay: 0.2
    })
  })
}

export function useGsapNavAnimation() {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (document.querySelectorAll('header nav a').length === 0) return
    gsap.from('header nav a', { opacity: 0, duration: 0.4, ease: 'power1.out', stagger: 0.05 })
  })
}

export function useGsapContentAnimation() {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (document.querySelectorAll('article').length === 0) return
    gsap.from('article', { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' })
  })
}

export function useCardHoverAnimation() {
  function handleCardHover(e: MouseEvent) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.to(e.currentTarget, { y: -4, duration: 0.3, ease: 'power1.out' })
  }

  function handleCardHoverOut(e: MouseEvent) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.to(e.currentTarget, { y: 0, duration: 0.3, ease: 'power1.out' })
  }

  return { handleCardHover, handleCardHoverOut }
}
