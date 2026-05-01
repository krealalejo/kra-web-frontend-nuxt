import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Composable to provide GSAP and its plugins.
 * Using direct imports here ensures that Vitest can easily mock GSAP
 * while maintaining compatibility with Nuxt's auto-import system.
 */
export function useGsap() {
  return { gsap, ScrollTrigger }
}
