import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('gsap', () => ({
  default: { from: vi.fn(), to: vi.fn() },
}))

vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue')>()
  return { ...actual, onMounted: (fn: () => void) => fn() }
})

function mockMatchMedia(prefersReducedMotion: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: prefersReducedMotion })),
  )
}

describe('useGsapAnimations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMatchMedia(false)
  })

  describe('useGsapHeroAnimation', () => {
    it('calls gsap.from for h1 and h1+p when motion is allowed', async () => {
      const gsap = (await import('gsap')).default
      const { useGsapHeroAnimation } = await import('./useGsapAnimations')
      useGsapHeroAnimation()
      expect(gsap.from).toHaveBeenCalledWith('h1', expect.objectContaining({ opacity: 0 }))
      expect(gsap.from).toHaveBeenCalledWith('h1 + p', expect.objectContaining({ opacity: 0 }))
    })

    it('does not call gsap.from when reduced motion is preferred', async () => {
      mockMatchMedia(true)
      const gsap = (await import('gsap')).default
      const { useGsapHeroAnimation } = await import('./useGsapAnimations')
      useGsapHeroAnimation()
      expect(gsap.from).not.toHaveBeenCalled()
    })
  })

  describe('useGsapCardStagger', () => {
    it('calls gsap.from with the default selector when motion is allowed', async () => {
      const gsap = (await import('gsap')).default
      const { useGsapCardStagger } = await import('./useGsapAnimations')
      useGsapCardStagger()
      expect(gsap.from).toHaveBeenCalledWith('li', expect.objectContaining({ opacity: 0 }))
    })

    it('calls gsap.from with a custom selector', async () => {
      const gsap = (await import('gsap')).default
      const { useGsapCardStagger } = await import('./useGsapAnimations')
      useGsapCardStagger('.card')
      expect(gsap.from).toHaveBeenCalledWith('.card', expect.objectContaining({ opacity: 0 }))
    })

    it('does not call gsap.from when reduced motion is preferred', async () => {
      mockMatchMedia(true)
      const gsap = (await import('gsap')).default
      const { useGsapCardStagger } = await import('./useGsapAnimations')
      useGsapCardStagger()
      expect(gsap.from).not.toHaveBeenCalled()
    })
  })

  describe('useGsapNavAnimation', () => {
    it('calls gsap.from for nav links when motion is allowed', async () => {
      const gsap = (await import('gsap')).default
      const { useGsapNavAnimation } = await import('./useGsapAnimations')
      useGsapNavAnimation()
      expect(gsap.from).toHaveBeenCalledWith('header nav a', expect.objectContaining({ opacity: 0 }))
    })

    it('does not call gsap.from when reduced motion is preferred', async () => {
      mockMatchMedia(true)
      const gsap = (await import('gsap')).default
      const { useGsapNavAnimation } = await import('./useGsapAnimations')
      useGsapNavAnimation()
      expect(gsap.from).not.toHaveBeenCalled()
    })
  })

  describe('useGsapContentAnimation', () => {
    it('calls gsap.from for article when motion is allowed', async () => {
      const gsap = (await import('gsap')).default
      const { useGsapContentAnimation } = await import('./useGsapAnimations')
      useGsapContentAnimation()
      expect(gsap.from).toHaveBeenCalledWith('article', expect.objectContaining({ opacity: 0 }))
    })

    it('does not call gsap.from when reduced motion is preferred', async () => {
      mockMatchMedia(true)
      const gsap = (await import('gsap')).default
      const { useGsapContentAnimation } = await import('./useGsapAnimations')
      useGsapContentAnimation()
      expect(gsap.from).not.toHaveBeenCalled()
    })
  })

  describe('useCardHoverAnimation', () => {
    it('calls gsap.to on handleCardHover when motion is allowed', async () => {
      const gsap = (await import('gsap')).default
      const { useCardHoverAnimation } = await import('./useGsapAnimations')
      const { handleCardHover } = useCardHoverAnimation()
      const target = document.createElement('div')
      handleCardHover({ currentTarget: target } as unknown as MouseEvent)
      expect(gsap.to).toHaveBeenCalledWith(target, expect.objectContaining({ y: -4 }))
    })

    it('skips gsap.to on handleCardHover when reduced motion is preferred', async () => {
      mockMatchMedia(true)
      const gsap = (await import('gsap')).default
      const { useCardHoverAnimation } = await import('./useGsapAnimations')
      const { handleCardHover } = useCardHoverAnimation()
      handleCardHover({ currentTarget: document.createElement('div') } as unknown as MouseEvent)
      expect(gsap.to).not.toHaveBeenCalled()
    })

    it('calls gsap.to on handleCardHoverOut when motion is allowed', async () => {
      const gsap = (await import('gsap')).default
      const { useCardHoverAnimation } = await import('./useGsapAnimations')
      const { handleCardHoverOut } = useCardHoverAnimation()
      const target = document.createElement('div')
      handleCardHoverOut({ currentTarget: target } as unknown as MouseEvent)
      expect(gsap.to).toHaveBeenCalledWith(target, expect.objectContaining({ y: 0 }))
    })

    it('skips gsap.to on handleCardHoverOut when reduced motion is preferred', async () => {
      mockMatchMedia(true)
      const gsap = (await import('gsap')).default
      const { useCardHoverAnimation } = await import('./useGsapAnimations')
      const { handleCardHoverOut } = useCardHoverAnimation()
      handleCardHoverOut({ currentTarget: document.createElement('div') } as unknown as MouseEvent)
      expect(gsap.to).not.toHaveBeenCalled()
    })
  })
})
