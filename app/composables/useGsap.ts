export function useGsap() {
  return Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]).then(([{ default: gsap }, { ScrollTrigger }]) => {
    if (typeof gsap.registerPlugin === 'function') {
      gsap.registerPlugin(ScrollTrigger)
    }
    return { gsap, ScrollTrigger }
  })
}

export function useGsapBase() {
  return import('gsap').then(({ default: gsap }) => ({ gsap }))
}
