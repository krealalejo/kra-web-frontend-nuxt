import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppFooterSocials from './AppFooterSocials.vue'

describe('AppFooterSocials', () => {
  it('renders a nav element with the social-links aria-label', async () => {
    const wrapper = await mountSuspended(AppFooterSocials)
    const nav = wrapper.find('nav')
    expect(nav.exists()).toBe(true)
    expect(nav.attributes('aria-label')).toBe('Social links')
  })

  it('renders exactly 3 social links', async () => {
    const wrapper = await mountSuspended(AppFooterSocials)
    const anchors = wrapper.findAll('a')
    expect(anchors).toHaveLength(3)
  })

  it('renders the LinkedIn link with the correct href', async () => {
    const wrapper = await mountSuspended(AppFooterSocials)
    const linkedin = wrapper.findAll('a').find(a => a.attributes('aria-label') === 'LinkedIn')
    expect(linkedin).toBeDefined()
    expect(linkedin!.attributes('href')).toBe('https://www.linkedin.com/in/kevinrealalejo/')
  })

  it('renders the GitHub link with the correct href', async () => {
    const wrapper = await mountSuspended(AppFooterSocials)
    const github = wrapper.findAll('a').find(a => a.attributes('aria-label') === 'GitHub')
    expect(github).toBeDefined()
    expect(github!.attributes('href')).toBe('https://github.com/krealalejo')
  })

  it('renders the World of Warcraft link with the correct href', async () => {
    const wrapper = await mountSuspended(AppFooterSocials)
    const wow = wrapper.findAll('a').find(a => a.attributes('aria-label') === 'World of Warcraft')
    expect(wow).toBeDefined()
    expect(wow!.attributes('href')).toBe(
      'https://worldofwarcraft.blizzard.com/es-es/character/eu/sanguino/Tfundoakames',
    )
  })

  it('all links open in a new tab', async () => {
    const wrapper = await mountSuspended(AppFooterSocials)
    const anchors = wrapper.findAll('a')
    for (const anchor of anchors) {
      expect(anchor.attributes('target')).toBe('_blank')
    }
  })

  it('all links include rel="noopener noreferrer" for security', async () => {
    const wrapper = await mountSuspended(AppFooterSocials)
    const anchors = wrapper.findAll('a')
    for (const anchor of anchors) {
      expect(anchor.attributes('rel')).toBe('noopener noreferrer')
    }
  })

  it('each link has a title attribute matching its aria-label', async () => {
    const wrapper = await mountSuspended(AppFooterSocials)
    const anchors = wrapper.findAll('a')
    for (const anchor of anchors) {
      expect(anchor.attributes('title')).toBe(anchor.attributes('aria-label'))
    }
  })

  it('each link contains an SVG icon', async () => {
    const wrapper = await mountSuspended(AppFooterSocials)
    const anchors = wrapper.findAll('a')
    for (const anchor of anchors) {
      expect(anchor.find('svg').exists()).toBe(true)
    }
  })

  it('each SVG icon has aria-hidden="true"', async () => {
    const wrapper = await mountSuspended(AppFooterSocials)
    const svgs = wrapper.findAll('svg')
    for (const svg of svgs) {
      expect(svg.attributes('aria-hidden')).toBe('true')
    }
  })
})
