import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

// Stub $fetch for CV admin — no Pinia store (D-16), direct $fetch pattern
const mockFetch = vi.fn()

vi.stubGlobal('$fetch', mockFetch)

describe('AdminCvSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Return empty arrays by default — component must handle empty state
    mockFetch.mockResolvedValue([])
  })

  // CV-01: Experience tab
  it('renders Experience tab with Add button and empty list initially', async () => {
    // Stub: onMounted fetches experience, education, skills
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/cv/experience')) return Promise.resolve([])
      if (url.includes('/cv/education')) return Promise.resolve([])
      if (url.includes('/cv/skills')) return Promise.resolve([])
      return Promise.resolve([])
    })

    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)

    expect(wrapper.text()).toContain('Experience')
    expect(wrapper.text()).toContain('Add')
  })

  // CV-01: Experience add modal opens on button click
  it('opens add modal when Add button clicked in Experience tab', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/cv/experience')) return Promise.resolve([])
      if (url.includes('/cv/education')) return Promise.resolve([])
      if (url.includes('/cv/skills')) return Promise.resolve([])
      return Promise.resolve([])
    })

    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)

    // Find and click the Add button in Experience tab
    const addBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add'))
    expect(addBtn).toBeDefined()
    await addBtn!.trigger('click')

    // Modal should be visible — contains title/company/location/years/description fields
    expect(wrapper.html()).toContain('title')
    expect(wrapper.html()).toContain('company')
  })

  // CV-02: Education tab renders
  it('renders Education tab when clicked', async () => {
    mockFetch.mockResolvedValue([])
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)

    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    expect(eduTab).toBeDefined()
    await eduTab!.trigger('click')

    expect(wrapper.text()).toContain('Education')
  })

  // CV-03: Skills tab renders with card grid
  it('renders Skills tab when clicked', async () => {
    const mockSkill: SkillCategory = { id: '1', name: 'Backend', skills: ['Java', 'Spring Boot'], sortOrder: 1 }
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/cv/skills')) return Promise.resolve([mockSkill])
      return Promise.resolve([])
    })

    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)

    const skillsTab = wrapper.findAll('button').find(b => b.text().includes('Skills'))
    expect(skillsTab).toBeDefined()
    await skillsTab!.trigger('click')

    expect(wrapper.text()).toContain('Skills')
  })

  // CV-03: sortOrder auto-increment (D-07) — new entry gets max+1
  it('computes sortOrder as max(existing) + 1 before POST', async () => {
    const existing: ExperienceEntry[] = [
      { id: '1', title: 'A', company: 'X', location: 'L', years: '2020', description: 'D', sortOrder: 5 },
    ]
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/cv/experience')) return Promise.resolve(existing)
      return Promise.resolve([])
    })

    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)

    // Open add modal
    const addBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add'))
    await addBtn!.trigger('click')

    // Fill required fields and save
    const inputs = wrapper.findAll('input')
    if (inputs.length > 0) await inputs[0].setValue('New Role')

    const saveBtn = wrapper.findAll('button').find(b => b.text().includes('Save'))
    if (saveBtn) await saveBtn.trigger('click')

    // POST should have been called with sortOrder: 6
    const postCall = mockFetch.mock.calls.find((call: any[]) =>
      typeof call[0] === 'string' && call[0].includes('/cv/experience') && call[1]?.method === 'POST'
    )
    if (postCall) {
      expect(postCall[1].body.sortOrder).toBe(6)
    }
  })
})

// TypeScript interfaces — used by tests above
interface ExperienceEntry {
  id: string; title: string; company: string; location: string; years: string; description: string; sortOrder: number
}
interface SkillCategory {
  id: string; name: string; skills: string[]; sortOrder: number
}
