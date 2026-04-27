import { describe, it, expect, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'

// Mock useAsyncData — returns lazy-resolved data
mockNuxtImport('useAsyncData', () => {
  return vi.fn().mockImplementation((_key: string, _fetcher: () => Promise<any>) => {
    return { data: ref(null) }
  })
})

// Mock useRuntimeConfig
mockNuxtImport('useRuntimeConfig', () => {
  return () => ({
    public: {
      apiBase: 'http://localhost:3001',
      s3PublicBucketUrl: 'http://localhost:9000',
    },
  })
})

describe('pages/cv.vue', () => {
  it('renders without crashing', async () => {
    const { default: CvPage } = await import('./cv.vue')
    const wrapper = await mountSuspended(CvPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the main heading with the expected name', async () => {
    const { default: CvPage } = await import('./cv.vue')
    const wrapper = await mountSuspended(CvPage)
    expect(wrapper.find('h1').text()).toBe('Kevin Real Alejo')
  })

  it('renders static Summary section always', async () => {
    const { default: CvPage } = await import('./cv.vue')
    const wrapper = await mountSuspended(CvPage)
    expect(wrapper.text()).toContain('Summary')
  })

  it('renders the skill tags', async () => {
    const { default: CvPage } = await import('./cv.vue')
    const wrapper = await mountSuspended(CvPage)
    const text = wrapper.text()
    expect(text).toContain('TypeScript')
    expect(text).toContain('AWS')
    expect(text).toContain('Nuxt')
  })
})

describe('cv.vue — API-driven sections (CV-04)', () => {
  it('renders Experience section when experienceData is populated', async () => {
    const experience = [
      { id: '1', title: 'Senior Engineer', company: 'ACME', location: 'Barcelona, ES', years: '2024 — Present', description: 'Built things', sortOrder: 1 }
    ]

    mockNuxtImport('useAsyncData', () => {
      return vi.fn().mockImplementation((key: string) => {
        if (key === 'cv-experience') return { data: ref(experience) }
        if (key === 'cv-education') return { data: ref([]) }
        if (key === 'cv-skills') return { data: ref([]) }
        return { data: ref(null) }
      })
    })

    const { default: CvPage } = await import('./cv.vue')
    const wrapper = await mountSuspended(CvPage)

    expect(wrapper.text()).toContain('Senior Engineer')
    expect(wrapper.text()).toContain('ACME')
  })

  it('hides Experience section when experienceData is empty (D-15)', async () => {
    mockNuxtImport('useAsyncData', () => {
      return vi.fn().mockImplementation((_key: string) => {
        return { data: ref([]) }
      })
    })

    const { default: CvPage } = await import('./cv.vue')
    const wrapper = await mountSuspended(CvPage)

    // Static sections remain; dynamic Experience/Education/Skills sections hidden
    expect(wrapper.text()).toContain('Summary') // Summary is static, always visible
    expect(wrapper.text()).not.toContain('Sample Role') // Old hardcoded content gone
  })

  it('renders Skills section with chip list when skillsData is populated', async () => {
    const skills = [
      { id: '1', name: 'Backend', skills: ['Java 21', 'Spring Boot'], sortOrder: 1 }
    ]

    mockNuxtImport('useAsyncData', () => {
      return vi.fn().mockImplementation((key: string) => {
        if (key === 'cv-skills') return { data: ref(skills) }
        return { data: ref([]) }
      })
    })

    const { default: CvPage } = await import('./cv.vue')
    const wrapper = await mountSuspended(CvPage)

    expect(wrapper.text()).toContain('Backend')
    expect(wrapper.text()).toContain('Java 21')
  })
})
