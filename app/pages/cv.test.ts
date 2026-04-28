import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import CvPage from './cv.vue'

// Variable to store mock data for useAsyncData
let mockData: Record<string, any> = {}

// Mock useAsyncData — returns data based on mockData state
mockNuxtImport('useAsyncData', () => {
  return vi.fn().mockImplementation((key: string) => {
    return { data: ref(mockData[key] || null) }
  })
})

describe('pages/cv.vue', () => {
  beforeEach(() => {
    mockData = {}
    vi.clearAllMocks()
  })

  it('renders without crashing', async () => {
    const wrapper = await mountSuspended(CvPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the main heading with the expected name', async () => {
    const wrapper = await mountSuspended(CvPage)
    expect(wrapper.find('h1').text().replace(/\s+/g, ' ')).toContain('Kevin Real Alejo')
  })

  it('renders static Summary section always', async () => {
    const wrapper = await mountSuspended(CvPage)
    expect(wrapper.text()).toContain('Summary')
  })

  it('renders static sections only when useAsyncData returns null', async () => {
    const wrapper = await mountSuspended(CvPage)
    const text = wrapper.text()
    expect(text).toContain('Summary')
    expect(text).toContain('Elsewhere')
    // Dynamic sections should not be visible when data is null
    expect(text).not.toContain('Experience')
  })
})

describe('cv.vue — API-driven sections (CV-04)', () => {
  beforeEach(() => {
    mockData = {}
  })

  it('renders Experience section when experienceData is populated', async () => {
    const experience = [
      { id: '1', title: 'Senior Engineer', company: 'ACME', location: 'Barcelona, ES', years: '2024 — Present', description: 'Built things', sortOrder: 1 }
    ]
    mockData['cv-experience'] = experience

    const wrapper = await mountSuspended(CvPage)

    expect(wrapper.text()).toContain('Senior Engineer')
    expect(wrapper.text()).toContain('ACME')
  })

  it('hides Experience section when experienceData is empty (D-15)', async () => {
    mockData['cv-experience'] = []

    const wrapper = await mountSuspended(CvPage)

    expect(wrapper.text()).toContain('Summary')
    expect(wrapper.find('section.cv-section:nth-of-type(2)').text()).not.toContain('Experience')
  })

  it('renders Skills section with chip list when skillsData is populated', async () => {
    const skills = [
      { id: '1', name: 'Backend', skills: ['Java 21', 'Spring Boot'], sortOrder: 1 }
    ]
    mockData['cv-skills'] = skills

    const wrapper = await mountSuspended(CvPage)

    expect(wrapper.text()).toContain('Backend')
    expect(wrapper.text()).toContain('Java 21')
  })

  it('renders Education section when educationData is populated', async () => {
    const education = [
      { id: '1', title: 'MSc Computer Science', institution: 'University', location: 'UK', years: '2020', description: 'Learned CS', sortOrder: 1 }
    ]
    mockData['cv-education'] = education

    const wrapper = await mountSuspended(CvPage)

    expect(wrapper.text()).toContain('MSc Computer Science')
    expect(wrapper.text()).toContain('University')
  })

  it('renders portrait image when profileData is populated', async () => {
    mockData['cv-profile'] = {
      cvPortraitUrl: 'images/portrait.jpg'
    }

    const wrapper = await mountSuspended(CvPage)
    
    const img = wrapper.find('img[alt="Kevin Real Alejo"]')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain('thumbnails/portrait-thumb.webp')
  })

  it('renders placeholder when profileData has no portrait', async () => {
    mockData['cv-profile'] = { cvPortraitUrl: null }
    const wrapper = await mountSuspended(CvPage)
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('portrait.jpg')
  })

  it('shows download CV button when cvPdfUrl is set', async () => {
    mockData['cv-profile'] = { cvPortraitUrl: null, cvPdfUrl: 'documents/my-cv.pdf' }
    const wrapper = await mountSuspended(CvPage)
    const downloadLink = wrapper.findAll('a').find(a => a.text().includes('Download CV'))
    expect(downloadLink).toBeDefined()
    expect(downloadLink!.attributes('download')).toBeDefined()
  })

  it('hides download CV button when cvPdfUrl is null', async () => {
    mockData['cv-profile'] = { cvPortraitUrl: null, cvPdfUrl: null }
    const wrapper = await mountSuspended(CvPage)
    const downloadLink = wrapper.findAll('a').find(a => a.text().includes('Download CV'))
    expect(downloadLink).toBeUndefined()
  })
})
