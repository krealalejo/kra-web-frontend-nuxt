import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CvPage from './cv.vue'

describe('pages/cv.vue', () => {
  it('renders without crashing', async () => {
    const wrapper = await mountSuspended(CvPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the main heading with the expected name', async () => {
    const wrapper = await mountSuspended(CvPage)
    expect(wrapper.find('h1').text()).toBe('Kevin Real Alejo')
  })

  it('renders all four main sections', async () => {
    const wrapper = await mountSuspended(CvPage)
    const headings = wrapper.findAll('.title').map(h => h.text())
    expect(headings).toContain('Summary')
    expect(headings).toContain('Experience')
    expect(headings).toContain('Skills')
    expect(headings).toContain('Education')
  })

  it('renders the skill tags', async () => {
    const wrapper = await mountSuspended(CvPage)
    const text = wrapper.text()
    expect(text).toContain('TypeScript')
    expect(text).toContain('AWS')
    expect(text).toContain('Nuxt')
  })
})
