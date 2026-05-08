import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

const expItem = { id: 'exp1', title: 'Engineer', company: 'Acme', location: 'Barcelona', years: '2020 — Present', description: 'Built stuff', sortOrder: 1 }
const eduItem = { id: 'edu1', title: 'BSc CS', institution: 'Uni', location: 'UK', years: '2018', description: 'Studied CS', sortOrder: 1 }
const catItem = { id: 'cat1', name: 'Backend', skills: ['Java', 'Spring'], sortOrder: 1 }

function setupEmptyFetch() {
  mockFetch.mockResolvedValue([])
}

function setupDataFetch() {
  mockFetch.mockImplementation((url: string) => {
    if (url === '/api/admin/cv/experience') return Promise.resolve([expItem])
    if (url === '/api/admin/cv/education') return Promise.resolve([eduItem])
    if (url === '/api/admin/cv/skills/categories') return Promise.resolve([catItem])
    return Promise.resolve({})
  })
}

async function mountWithData() {
  const { default: AdminCvSection } = await import('./AdminCvSection.vue')
  const wrapper = await mountSuspended(AdminCvSection)
  await flushPromises()
  await nextTick()
  return wrapper
}

describe('AdminCvSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    setupEmptyFetch()
  })

  it('renders Experience tab initially', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    expect(wrapper.text()).toContain('Experience')
  })

  it('renders Education tab when clicked', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')
    expect(wrapper.text()).toContain('Education')
  })

  it('renders Skills tab when clicked', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const skillsTab = wrapper.findAll('button').find(b => b.text().includes('Skills'))
    await skillsTab!.trigger('click')
    expect(wrapper.text()).toContain('Skills')
  })

  it('renders CV PDF tab when clicked', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const pdfTab = wrapper.findAll('button').find(b => b.text().includes('CV PDF'))
    await pdfTab!.trigger('click')
    expect(wrapper.text()).toContain('CV PDF')
  })

  it('opens add experience modal', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const addBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add experience'))
    await addBtn!.trigger('click')
    expect(wrapper.text()).toContain('Add Experience')
  })

  it('opens add education modal', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')
    const addBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add education'))
    await addBtn!.trigger('click')
    expect(wrapper.text()).toContain('Add Education')
  })

  it('closes experience modal on cancel', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const addBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add experience'))
    await addBtn!.trigger('click')
    expect(wrapper.findAll('h3').some(h => h.text().includes('Add Experience'))).toBe(true)

    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    await cancelBtn!.trigger('click')
    await nextTick()
    expect(wrapper.findAll('h3').some(h => h.text().includes('Add Experience'))).toBe(false)
  })

  it('shows error on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Network error')
  })
})

describe('AdminCvSection — Experience CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    setupDataFetch()
  })

  it('shows experience item after data load', async () => {
    const wrapper = await mountWithData()
    expect(wrapper.text()).toContain('Engineer')
    expect(wrapper.text()).toContain('Acme')
  })

  it('opens edit experience modal with prefilled data', async () => {
    const wrapper = await mountWithData()
    const editBtn = wrapper.find('button[title="Edit"]')
    await editBtn.trigger('click')
    expect(wrapper.text()).toContain('Edit Experience')
    const titleInput = wrapper.find('input[placeholder="e.g. Senior Software Engineer"]')
    expect((titleInput.element as HTMLInputElement).value).toBe('Engineer')
  })

  it('saves new experience entry (add mode)', async () => {
    setupEmptyFetch()
    const createdItem = { id: 'exp2', title: 'New Role', company: 'Corp', location: 'NYC', years: '2023', description: 'Desc', sortOrder: 1 }
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (opts?.method === 'POST') return Promise.resolve(createdItem)
      return Promise.resolve([])
    })

    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    await flushPromises()

    const addBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add experience'))
    await addBtn!.trigger('click')

    const inputs = wrapper.findAll('input')
    await inputs[0]!.setValue('New Role')
    await inputs[1]!.setValue('Corp')

    const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save')
    await saveBtn!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(mockFetch).toHaveBeenCalledWith('/api/admin/cv/experience', expect.objectContaining({ method: 'POST' }))
  })

  it('updates experience entry (edit mode)', async () => {
    const updatedItem = { ...expItem, title: 'Updated Role' }
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([expItem])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (opts?.method === 'PUT') return Promise.resolve(updatedItem)
      return Promise.resolve({})
    })

    const wrapper = await mountWithData()
    const editBtn = wrapper.find('button[title="Edit"]')
    await editBtn.trigger('click')

    const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save')
    await saveBtn!.trigger('click')
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/cv/experience/'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('shows error when save experience fails', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([expItem])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (opts?.method === 'PUT') return Promise.reject(new Error('Save failed'))
      return Promise.resolve({})
    })

    const wrapper = await mountWithData()
    const editBtn = wrapper.find('button[title="Edit"]')
    await editBtn.trigger('click')

    const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save')
    await saveBtn!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Save failed')
  })

  it('deletes experience entry', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([expItem])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (opts?.method === 'DELETE') return Promise.resolve({})
      return Promise.resolve({})
    })

    const wrapper = await mountWithData()
    expect(wrapper.text()).toContain('Engineer')

    const deleteBtn = wrapper.find('button[title="Delete"]')
    await deleteBtn.trigger('click')
    await flushPromises()
    await nextTick()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/cv/experience/'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('cancels delete when confirm returns false', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const wrapper = await mountWithData()
    const deleteBtn = wrapper.find('button[title="Delete"]')
    await deleteBtn.trigger('click')
    await flushPromises()

    const deleteCalls = mockFetch.mock.calls.filter((c: any[]) => c[1]?.method === 'DELETE')
    expect(deleteCalls.length).toBe(0)
  })
})

describe('AdminCvSection — Education CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([eduItem])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      return Promise.resolve({})
    })
  })

  it('shows education item after data load', async () => {
    const wrapper = await mountWithData()
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')
    expect(wrapper.text()).toContain('BSc CS')
    expect(wrapper.text()).toContain('Uni')
  })

  it('opens edit education modal with prefilled data', async () => {
    const wrapper = await mountWithData()
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')

    const editBtn = wrapper.find('button[title="Edit"]')
    await editBtn.trigger('click')
    expect(wrapper.text()).toContain('Edit Education')
  })

  it('saves new education entry (add mode)', async () => {
    const createdEdu = { ...eduItem, id: 'edu2', title: 'MSc' }
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (opts?.method === 'POST') return Promise.resolve(createdEdu)
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      return Promise.resolve({})
    })

    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    await flushPromises()

    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')

    const addBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add education'))
    await addBtn!.trigger('click')

    const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save')
    await saveBtn!.trigger('click')
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith('/api/admin/cv/education', expect.objectContaining({ method: 'POST' }))
  })

  it('updates education entry (edit mode)', async () => {
    const updatedEdu = { ...eduItem, title: 'PhD' }
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([eduItem])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (opts?.method === 'PUT') return Promise.resolve(updatedEdu)
      return Promise.resolve({})
    })

    const wrapper = await mountWithData()
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')

    const editBtn = wrapper.find('button[title="Edit"]')
    await editBtn.trigger('click')

    const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save')
    await saveBtn!.trigger('click')
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/cv/education/'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('shows error when save education fails', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([eduItem])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (opts?.method === 'PUT') return Promise.reject(new Error('Edu save failed'))
      return Promise.resolve({})
    })

    const wrapper = await mountWithData()
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')

    const editBtn = wrapper.find('button[title="Edit"]')
    await editBtn.trigger('click')

    const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save')
    await saveBtn!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Edu save failed')
  })

  it('deletes education entry', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([eduItem])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (opts?.method === 'DELETE') return Promise.resolve({})
      return Promise.resolve({})
    })

    const wrapper = await mountWithData()
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')

    const deleteBtn = wrapper.find('button[title="Delete"]')
    await deleteBtn.trigger('click')
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/cv/education/'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})

describe('AdminCvSection — Skills CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([catItem])
      return Promise.resolve({})
    })
  })

  async function mountSkillsTab() {
    const wrapper = await mountWithData()
    const skillsTab = wrapper.findAll('button').find(b => b.text().includes('Skills'))
    await skillsTab!.trigger('click')
    return wrapper
  }

  it('shows skill category card after data load', async () => {
    const wrapper = await mountSkillsTab()
    expect(wrapper.text()).toContain('Backend')
    expect(wrapper.text()).toContain('Java')
    expect(wrapper.text()).toContain('Spring')
  })

  it('adds skill via enter key on input', async () => {
    const wrapper = await mountSkillsTab()
    const input = wrapper.find('input[placeholder="Add skill… (Enter to add)"]')
    await input.setValue('TypeScript')
    await input.trigger('keydown.enter')
    expect(wrapper.text()).toContain('TypeScript')
  })

  it('does not add duplicate skill', async () => {
    const wrapper = await mountSkillsTab()
    const input = wrapper.find('input[placeholder="Add skill… (Enter to add)"]')
    await input.setValue('Java')
    await input.trigger('keydown.enter')
    const occurrences = wrapper.text().split('Java').length - 1
    expect(occurrences).toBe(1)
  })

  it('does not add empty skill', async () => {
    const wrapper = await mountSkillsTab()
    const chipsBefore = wrapper.findAll('.chip').length
    const input = wrapper.find('input[placeholder="Add skill… (Enter to add)"]')
    await input.setValue('  ')
    await input.trigger('keydown.enter')
    expect(wrapper.findAll('.chip').length).toBe(chipsBefore)
  })

  it('removes skill chip via ✕ button', async () => {
    const wrapper = await mountSkillsTab()
    expect(wrapper.text()).toContain('Java')

    const removeButtons = wrapper.findAll('.chip button')
    await removeButtons[0]!.trigger('click')
    await nextTick()
    expect(wrapper.text()).not.toContain('Java')
  })

  it('saves category skills via save button', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([catItem])
      if (opts?.method === 'PUT') return Promise.resolve({})
      return Promise.resolve({})
    })

    const wrapper = await mountSkillsTab()
    const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save')
    await saveBtn!.trigger('click')
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/cv/skills/categories/'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('shows error when save category fails', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([catItem])
      if (opts?.method === 'PUT') return Promise.reject(new Error('Cat save failed'))
      return Promise.resolve({})
    })

    const wrapper = await mountSkillsTab()
    const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save')
    await saveBtn!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Cat save failed')
  })

  it('deletes category via ✕ button on card header', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([catItem])
      if (opts?.method === 'DELETE') return Promise.resolve({})
      return Promise.resolve({})
    })

    const wrapper = await mountSkillsTab()
    const deleteCatBtn = wrapper.find('button[title="Delete category"]')
    await deleteCatBtn.trigger('click')
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/cv/skills/categories/'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('opens add category form and submits', async () => {
    const newCat = { id: 'cat2', name: 'Frontend', skills: [], sortOrder: 2 }
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([catItem])
      if (opts?.method === 'POST') return Promise.resolve(newCat)
      return Promise.resolve({})
    })

    const wrapper = await mountSkillsTab()
    const addCatBtn = wrapper.findAll('button').find(b => b.text().includes('Add Category'))
    await addCatBtn!.trigger('click')
    await nextTick()

    const nameInput = wrapper.find('input[placeholder="e.g. Backend"]')
    await nameInput.setValue('Frontend')

    const createBtn = wrapper.findAll('button').find(b => b.text() === 'Create')
    await createBtn!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/cv/skills/categories',
      expect.objectContaining({ method: 'POST', body: expect.objectContaining({ name: 'Frontend' }) })
    )
  })

  it('cancels add category form', async () => {
    const wrapper = await mountSkillsTab()
    const addCatBtn = wrapper.findAll('button').find(b => b.text().includes('Add Category'))
    await addCatBtn!.trigger('click')
    await nextTick()

    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    await cancelBtn!.trigger('click')
    await nextTick()

    expect(wrapper.find('input[placeholder="e.g. Backend"]').exists()).toBe(false)
  })

  it('does not submit add category when name is empty', async () => {
    const wrapper = await mountSkillsTab()
    const addCatBtn = wrapper.findAll('button').find(b => b.text().includes('Add Category'))
    await addCatBtn!.trigger('click')
    await nextTick()

    const createBtn = wrapper.findAll('button').find(b => b.text() === 'Create')
    await createBtn!.trigger('click')
    await flushPromises()

    const postCalls = mockFetch.mock.calls.filter((c: any[]) => c[1]?.method === 'POST')
    expect(postCalls.length).toBe(0)
  })

  it('shows error when add category fails', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (opts?.method === 'POST') return Promise.reject(new Error('Create failed'))
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([catItem])
      return Promise.resolve({})
    })

    const wrapper = await mountSkillsTab()
    const addCatBtn = wrapper.findAll('button').find(b => b.text().includes('Add Category'))
    await addCatBtn!.trigger('click')
    await nextTick()

    const nameInput = wrapper.find('input[placeholder="e.g. Backend"]')
    await nameInput.setValue('New Cat')

    const createBtn = wrapper.findAll('button').find(b => b.text() === 'Create')
    await createBtn!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Create failed')
  })
})

describe('AdminCvSection — PDF Tab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (typeof url === 'string' && url.includes('/config/profile')) return Promise.resolve({ homePortraitUrl: null, cvPortraitUrl: null, cvPdfUrl: null })
      return Promise.resolve({})
    })
  })

  async function mountPdfTab() {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    await flushPromises()
    await nextTick()
    const pdfTab = wrapper.findAll('button').find(b => b.text().includes('CV PDF'))
    await pdfTab!.trigger('click')
    await nextTick()
    return wrapper
  }

  it('renders CV PDF tab content', async () => {
    const wrapper = await mountPdfTab()
    expect(wrapper.text()).toContain('CV PDF')
  })

  it('loads existing cvPdfUrl from profile on mount', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (typeof url === 'string' && url.includes('/config/profile')) return Promise.resolve({ homePortraitUrl: null, cvPortraitUrl: null, cvPdfUrl: 'documents/cv.pdf' })
      return Promise.resolve({})
    })
    const wrapper = await mountPdfTab()
    expect(wrapper.text()).toContain('CV PDF')
  })

  it('rejects non-PDF file type', async () => {
    const wrapper = await mountPdfTab()
    const input = wrapper.find('input[type="file"]')
    const file = new File(['content'], 'test.docx', { type: 'application/msword' })
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Only PDF files are allowed')
  })

  it('rejects oversized PDF file', async () => {
    const wrapper = await mountPdfTab()
    const input = wrapper.find('input[type="file"]')
    const bigContent = new Uint8Array(11 * 1024 * 1024)
    const file = new File([bigContent], 'big.pdf', { type: 'application/pdf' })
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('PDF must be smaller than 10 MB')
  })

  it('uploads PDF successfully', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (typeof url === 'string' && url.includes('/config/profile')) return Promise.resolve({ homePortraitUrl: null, cvPortraitUrl: null, cvPdfUrl: null })
      if (url === '/api/admin/upload') return Promise.resolve({ uploadUrl: 'https://s3.example.com/upload', s3Key: 'documents/cv.pdf' })
      if (opts?.method === 'PUT' && typeof url === 'string' && url.includes('s3.example.com')) return Promise.resolve({})
      if (url === '/api/admin/profile') return Promise.resolve({})
      return Promise.resolve({})
    })

    const wrapper = await mountPdfTab()
    const input = wrapper.find('input[type="file"]')
    const file = new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' })
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await flushPromises()
    await wrapper.vm.$nextTick()
    expect(mockFetch).toHaveBeenCalledWith('/api/admin/upload', expect.objectContaining({ method: 'POST' }))
    expect(mockFetch).toHaveBeenCalledWith('/api/admin/profile', expect.objectContaining({
      method: 'PUT',
      body: {
        cvPdfUrl: 'documents/cv.pdf',
        homePortraitUrl: null,
        cvPortraitUrl: null
      }
    }))
  })

  it('shows upload error when upload fails', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (typeof url === 'string' && url.includes('/config/profile')) return Promise.resolve({ homePortraitUrl: null, cvPortraitUrl: null, cvPdfUrl: null })
      if (url === '/api/admin/upload') return Promise.reject(new Error('Upload error'))
      return Promise.resolve({})
    })

    const wrapper = await mountPdfTab()
    const input = wrapper.find('input[type="file"]')
    const file = new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' })
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await flushPromises()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Upload error')
  })

  it('removes PDF when remove button is clicked', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (typeof url === 'string' && url.includes('/config/profile')) return Promise.resolve({ homePortraitUrl: null, cvPortraitUrl: null, cvPdfUrl: 'documents/cv.pdf' })
      if (url === '/api/admin/profile' && opts?.method === 'PUT') return Promise.resolve({})
      return Promise.resolve({})
    })

    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    await flushPromises()
    await nextTick()
    const pdfTab = wrapper.findAll('button').find(b => b.text().includes('CV PDF'))
    await pdfTab!.trigger('click')
    await nextTick()

    const removeBtn = wrapper.findAll('button').find(b => b.text().includes('Remove'))
    if (removeBtn) {
      await removeBtn.trigger('click')
      await flushPromises()
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/profile', expect.objectContaining({
        method: 'PUT',
        body: {
          cvPdfUrl: null,
          homePortraitUrl: null,
          cvPortraitUrl: null
        }
      }))
    }
  })

  it('shows error when remove PDF fails', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (typeof url === 'string' && url.includes('/config/profile')) return Promise.resolve({ homePortraitUrl: null, cvPortraitUrl: null, cvPdfUrl: 'documents/cv.pdf' })
      if (url === '/api/admin/profile' && opts?.method === 'PUT') return Promise.reject(new Error('Remove failed'))
      return Promise.resolve({})
    })

    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    await flushPromises()
    await nextTick()
    const pdfTab = wrapper.findAll('button').find(b => b.text().includes('CV PDF'))
    await pdfTab!.trigger('click')
    await nextTick()

    const removeBtn = wrapper.findAll('button').find(b => b.text().includes('Remove'))
    if (removeBtn) {
      await removeBtn.trigger('click')
      await flushPromises()
      await nextTick()
      expect(wrapper.text()).toContain('Remove failed')
    }
  })
})

describe('AdminCvSection — Experience modal field inputs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      return Promise.resolve({})
    })
  })

  it('accepts typed input in exp modal location, years, description fields', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const addBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add experience'))
    await addBtn!.trigger('click')
    await nextTick()

    await wrapper.find('#exp-location').setValue('London, UK')
    await wrapper.find('#exp-years').setValue('2020 — Present')
    await wrapper.find('#exp-description').setValue('Led backend development')

    expect((wrapper.find('#exp-location').element as HTMLInputElement).value).toBe('London, UK')
    expect((wrapper.find('#exp-years').element as HTMLInputElement).value).toBe('2020 — Present')
    expect((wrapper.find('#exp-description').element as HTMLTextAreaElement).value).toBe('Led backend development')
  })

  it('closes exp modal when backdrop is clicked', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const addBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add experience'))
    await addBtn!.trigger('click')
    await nextTick()
    expect(wrapper.findAll('h3').some(h => h.text().includes('Add Experience'))).toBe(true)

    const modalH3 = wrapper.findAll('h3').find(h => h.text().includes('Add Experience'))
    const backdropEl = modalH3?.element.parentElement?.parentElement
    if (backdropEl) {
      backdropEl.dispatchEvent(new MouseEvent('click', { bubbles: false, cancelable: true }))
      await nextTick()
    }
    expect(wrapper.findAll('h3').some(h => h.text().includes('Add Experience'))).toBe(false)
  })

  it('closes edu modal when backdrop is clicked', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')
    const addBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add education'))
    await addBtn!.trigger('click')
    await nextTick()
    expect(wrapper.findAll('h3').some(h => h.text().includes('Add Education'))).toBe(true)

    const modalH3 = wrapper.findAll('h3').find(h => h.text().includes('Add Education'))
    const backdropEl = modalH3?.element.parentElement?.parentElement
    if (backdropEl) {
      backdropEl.dispatchEvent(new MouseEvent('click', { bubbles: false, cancelable: true }))
      await nextTick()
    }
    expect(wrapper.findAll('h3').some(h => h.text().includes('Add Education'))).toBe(false)
  })
})

describe('AdminCvSection — non-Error rejection fallbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([expItem])
      if (url === '/api/admin/cv/education') return Promise.resolve([eduItem])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([catItem])
      return Promise.resolve({})
    })
  })

  it('shows "Failed to load CV data" when onMounted fetch rejects with non-Error', async () => {
    mockFetch.mockRejectedValue('string rejection')
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    await flushPromises()
    expect(wrapper.text()).toContain('Failed to load CV data')
  })

  it('shows "Save failed" when saveExpModal rejects with non-Error', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([expItem])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (opts?.method === 'PUT') return Promise.reject('string err')
      return Promise.resolve({})
    })
    const wrapper = await mountWithData()
    const editBtn = wrapper.find('button[title="Edit"]')
    await editBtn.trigger('click')
    const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save')
    await saveBtn!.trigger('click')
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Save failed')
  })

  it('shows "Delete failed" when deleteExp rejects with non-Error', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([expItem])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (opts?.method === 'DELETE') return Promise.reject('string err')
      return Promise.resolve({})
    })
    const wrapper = await mountWithData()
    const deleteBtn = wrapper.find('button[title="Delete"]')
    await deleteBtn.trigger('click')
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Delete failed')
  })

  it('shows "Save failed" when saveEduModal rejects with non-Error', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([eduItem])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (opts?.method === 'PUT') return Promise.reject('string err')
      return Promise.resolve({})
    })
    const wrapper = await mountWithData()
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')
    const editBtn = wrapper.find('button[title="Edit"]')
    await editBtn.trigger('click')
    const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save')
    await saveBtn!.trigger('click')
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Save failed')
  })

  it('shows "Delete failed" when deleteEdu rejects with non-Error', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([eduItem])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (opts?.method === 'DELETE') return Promise.reject('string err')
      return Promise.resolve({})
    })
    const wrapper = await mountWithData()
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')
    const deleteBtn = wrapper.find('button[title="Delete"]')
    await deleteBtn.trigger('click')
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Delete failed')
  })

  it('shows "Save failed" when saveCategory rejects with non-Error', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([catItem])
      if (opts?.method === 'PUT') return Promise.reject('string err')
      return Promise.resolve({})
    })
    const wrapper = await mountWithData()
    const skillsTab = wrapper.findAll('button').find(b => b.text().includes('Skills'))
    await skillsTab!.trigger('click')
    const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save')
    await saveBtn!.trigger('click')
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Save failed')
  })

  it('shows "Delete failed" when deleteCategory rejects with non-Error', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([catItem])
      if (opts?.method === 'DELETE') return Promise.reject('string err')
      return Promise.resolve({})
    })
    const wrapper = await mountWithData()
    const skillsTab = wrapper.findAll('button').find(b => b.text().includes('Skills'))
    await skillsTab!.trigger('click')
    const deleteCatBtn = wrapper.find('button[title="Delete category"]')
    await deleteCatBtn.trigger('click')
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Delete failed')
  })
})

describe('AdminCvSection — PDF non-Error fallbacks and no-file', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (typeof url === 'string' && url.includes('/config/profile')) return Promise.resolve({ homePortraitUrl: null, cvPortraitUrl: null, cvPdfUrl: 'documents/cv.pdf' })
      return Promise.resolve({})
    })
  })

  async function mountPdfTab() {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    await flushPromises()
    await nextTick()
    const pdfTab = wrapper.findAll('button').find(b => b.text().includes('CV PDF'))
    await pdfTab!.trigger('click')
    await nextTick()
    return wrapper
  }

  it('shows "Upload failed" when handlePdfUpload rejects with non-Error', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (typeof url === 'string' && url.includes('/config/profile')) return Promise.resolve({ homePortraitUrl: null, cvPortraitUrl: null, cvPdfUrl: null })
      if (url === '/api/admin/upload') return Promise.reject('string err')
      return Promise.resolve({})
    })
    const wrapper = await mountPdfTab()
    const input = wrapper.find('input[type="file"]')
    const file = new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' })
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await flushPromises()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Upload failed')
  })

  it('shows "Removal failed" when removePdf rejects with non-Error', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (typeof url === 'string' && url.includes('/config/profile')) return Promise.resolve({ homePortraitUrl: null, cvPortraitUrl: null, cvPdfUrl: 'documents/cv.pdf' })
      if (url === '/api/admin/profile' && opts?.method === 'PUT') return Promise.reject('string err')
      return Promise.resolve({})
    })
    const wrapper = await mountPdfTab()
    const removeBtn = wrapper.findAll('button').find(b => b.text().includes('Remove'))
    if (removeBtn) {
      await removeBtn.trigger('click')
      await flushPromises()
      await nextTick()
      expect(wrapper.text()).toContain('Removal failed')
    }
  })

  it('does nothing when no file is selected for PDF upload', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      if (typeof url === 'string' && url.includes('/config/profile')) return Promise.resolve({ homePortraitUrl: null, cvPortraitUrl: null, cvPdfUrl: null })
      return Promise.resolve({})
    })
    const wrapper = await mountPdfTab()
    const fetchCallsBefore = mockFetch.mock.calls.length
    const input = wrapper.find('input[type="file"]')
    await input.trigger('change')
    expect(mockFetch.mock.calls.length).toBe(fetchCallsBefore)
  })
})

describe('AdminCvSection — Education modal interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/admin/cv/experience') return Promise.resolve([])
      if (url === '/api/admin/cv/education') return Promise.resolve([])
      if (url === '/api/admin/cv/skills/categories') return Promise.resolve([])
      return Promise.resolve({})
    })
  })

  it('closes education modal on cancel', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')
    const addBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add education'))
    await addBtn!.trigger('click')
    expect(wrapper.text()).toContain('Add Education')

    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    await cancelBtn!.trigger('click')
    await nextTick()
    expect(wrapper.findAll('h3').some(h => h.text().includes('Add Education'))).toBe(false)
  })

  it('accepts typed input in education modal fields', async () => {
    const { default: AdminCvSection } = await import('./AdminCvSection.vue')
    const wrapper = await mountSuspended(AdminCvSection)
    const eduTab = wrapper.findAll('button').find(b => b.text().includes('Education'))
    await eduTab!.trigger('click')
    const addBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add education'))
    await addBtn!.trigger('click')

    await wrapper.find('#edu-title').setValue('BSc Computer Science')
    await wrapper.find('#edu-institution').setValue('MIT')
    await wrapper.find('#edu-location').setValue('Cambridge, US')
    await wrapper.find('#edu-years').setValue('2020 — 2024')
    await wrapper.find('#edu-description').setValue('Studied algorithms')

    expect((wrapper.find('#edu-title').element as HTMLInputElement).value).toBe('BSc Computer Science')
    expect((wrapper.find('#edu-institution').element as HTMLInputElement).value).toBe('MIT')
  })
})
