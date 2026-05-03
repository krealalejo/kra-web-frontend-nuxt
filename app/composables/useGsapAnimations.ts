import { onMounted } from 'vue'

export function useGsapHeroAnimation() {
  onMounted(async () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (document.querySelectorAll('.gsap-hero-item').length === 0) return
    const { gsap } = await useGsap()
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
  onMounted(async () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (document.querySelectorAll(selector).length === 0) return
    const { gsap } = await useGsap()
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
  onMounted(async () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (document.querySelectorAll('header nav a').length === 0) return
    const { gsap } = await useGsap()
    gsap.from('header nav a', { opacity: 0, duration: 0.4, ease: 'power1.out', stagger: 0.05 })
  })
}

export function useGsapContentAnimation() {
  onMounted(async () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (document.querySelectorAll('article').length === 0) return
    const { gsap } = await useGsap()
    gsap.from('article', { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' })
  })
}

async function handleCardHover(e: MouseEvent) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { gsap } = await useGsap()
  gsap.to(e.currentTarget, { y: -4, duration: 0.3, ease: 'power1.out' })
}

async function handleCardHoverOut(e: MouseEvent) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { gsap } = await useGsap()
  gsap.to(e.currentTarget, { y: 0, duration: 0.3, ease: 'power1.out' })
}

export function useCardHoverAnimation() {
  return { handleCardHover, handleCardHoverOut }
}
