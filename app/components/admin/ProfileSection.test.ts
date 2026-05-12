import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import ProfileSection from './ProfileSection.vue'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('ProfileSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockFetch.mockResolvedValue({
      homePortraitUrl: 'portraits/home.webp',
      cvPortraitUrl: 'portraits/cv.webp',
      cvPdfUrl: null
    })
  })

  it('renders both portrait previews when data is available', async () => {
    const wrapper = await mountSuspended(ProfileSection)

    const imgs = wrapper.findAll('img')
    expect(imgs.length).toBe(2)
    expect(imgs[0].attributes('src')).toContain('portraits/home.webp')
    expect(imgs[1].attributes('src')).toContain('portraits/cv.webp')
  })

  it('renders placeholders when data is null', async () => {
    mockFetch.mockResolvedValue({ homePortraitUrl: null, cvPortraitUrl: null })
    const wrapper = await mountSuspended(ProfileSection)

    expect(wrapper.findAll('img').length).toBe(0)
    expect(wrapper.text()).toContain('No portrait')
  })

  it('handles fetch error correctly (non-404)', async () => {
    const error = new Error('Fetch failed')
    ;(error as any).response = { status: 500 }
    mockFetch.mockRejectedValue(error)

    const wrapper = await mountSuspended(ProfileSection)
    expect(wrapper.text()).toContain('Failed to load current portraits')
  })

  it('ignores 404 fetch error', async () => {
    const error = new Error('Not found')
    ;(error as any).response = { status: 404 }
    mockFetch.mockRejectedValue(error)

    const wrapper = await mountSuspended(ProfileSection)
    expect(wrapper.text()).not.toContain('Failed to load current portraits')
  })

  it('validates file type on upload', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    const input = wrapper.find('input[type="file"]')

    const file = new File([''], 'test.pdf', { type: 'application/pdf' })
    Object.defineProperty(input.element, 'files', { value: [file] })

    await input.trigger('change')
    expect(wrapper.text()).toContain('Only JPEG, PNG, or WebP images are allowed')
  })

  it('validates file size on upload', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    const input = wrapper.find('input[type="file"]')

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 21 * 1024 * 1024 })
    Object.defineProperty(input.element, 'files', { value: [file] })

    await input.trigger('change')
    expect(wrapper.text()).toContain('Image must be smaller than 20 MB')
  })

  it('performs full upload flow for home portrait', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    const input = wrapper.find('input[type="file"]')

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(input.element, 'files', { value: [file] })

    mockFetch.mockImplementation((url) => {
      if (url === '/api/admin/upload') return Promise.resolve({ uploadUrl: 's3://url', s3Key: 'portraits/home.webp' })
      if (url === 's3://url') return Promise.resolve({})
      if (url === '/api/admin/profile') return Promise.resolve({})
      if (url.includes('/api/admin/image-status')) return Promise.resolve({ ready: true })
      return Promise.resolve({})
    })

    await input.trigger('change')

    expect(wrapper.text()).toContain('Processing')

    vi.advanceTimersByTime(2000)

    await nextTick()
    await nextTick()
    await nextTick()

    const img = wrapper.find('img[alt="Home portrait"]')
    expect(img.attributes('src')).toContain('portraits/home.webp')
    vi.useRealTimers()
  })

  it('performs full upload flow for CV portrait', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    const input = wrapper.findAll('input[type="file"]')[1]

    const file = new File([''], 'test-cv.jpg', { type: 'image/jpeg' })
    Object.defineProperty(input.element, 'files', { value: [file] })

    mockFetch.mockImplementation((url) => {
      if (url === '/api/admin/upload') return Promise.resolve({ uploadUrl: 's3://cv-url', s3Key: 'portraits/cv.webp' })
      if (url === 's3://cv-url') return Promise.resolve({})
      if (url === '/api/admin/profile') return Promise.resolve({})
      if (url.includes('/api/admin/image-status')) return Promise.resolve({ ready: true })
      return Promise.resolve({})
    })

    await input.trigger('change')

    expect(wrapper.text()).toContain('Processing')

    vi.advanceTimersByTime(2000)

    await nextTick()
    await nextTick()
    await nextTick()

    const img = wrapper.find('img[alt="CV portrait"]')
    expect(img.attributes('src')).toContain('portraits/cv.webp')
    vi.useRealTimers()
  })

  it('handles upload error', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    const input = wrapper.find('input[type="file"]')

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(input.element, 'files', { value: [file] })

    mockFetch.mockRejectedValue(new Error('Network error during upload'))
    await input.trigger('change')
    expect(wrapper.text()).toContain('Network error during upload')
  })

  it('handles portrait deletion', async () => {
    const wrapper = await mountSuspended(ProfileSection)

    expect(wrapper.findAll('img').length).toBe(2)

    const deleteBtn = wrapper.find('button[title="Remove portrait"]')
    expect(deleteBtn.exists()).toBe(true)

    mockFetch.mockResolvedValue({})

    await deleteBtn.trigger('click')

    expect(mockFetch).toHaveBeenCalledWith('/api/admin/profile', expect.objectContaining({
      method: 'PUT',
      body: {
        homePortraitUrl: null,
        cvPortraitUrl: 'portraits/cv.webp',
        cvPdfUrl: null
      }
    }))

    await nextTick()
    expect(wrapper.find('img[alt="Home portrait"]').exists()).toBe(false)
  })

  it('handles CV portrait deletion', async () => {
    const wrapper = await mountSuspended(ProfileSection)

    const deleteBtns = wrapper.findAll('button[title="Remove portrait"]')
    expect(deleteBtns.length).toBe(2)

    mockFetch.mockResolvedValue({})

    await deleteBtns[1].trigger('click')

    expect(mockFetch).toHaveBeenCalledWith('/api/admin/profile', expect.objectContaining({
      method: 'PUT',
      body: {
        homePortraitUrl: 'portraits/home.webp',
        cvPortraitUrl: null,
        cvPdfUrl: null
      }
    }))

    await nextTick()
    expect(wrapper.find('img[alt="CV portrait"]').exists()).toBe(false)
  })

  it('handles removal error', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    const deleteBtn = wrapper.find('button[title="Remove portrait"]')

    mockFetch.mockRejectedValue(new Error('Removal failed'))
    await deleteBtn.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Removal failed')
  })

  it('stops polling after 15 failed not-ready responses', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    const input = wrapper.find('input[type="file"]')

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(input.element, 'files', { value: [file] })

    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/admin/upload') return Promise.resolve({ uploadUrl: 's3://url', s3Key: 'portraits/home.webp' })
      if (url === 's3://url') return Promise.resolve({})
      if (url === '/api/admin/profile') return Promise.resolve({})
      if (url.includes('/api/admin/image-status')) return Promise.resolve({ ready: false })
      return Promise.resolve({})
    })

    await input.trigger('change')
    await flushPromises()

    for (let i = 0; i < 15; i++) {
      vi.advanceTimersByTime(2000)
      await flushPromises()
    }

    expect(wrapper.text()).toContain('Image uploaded but thumbnail is still generating.')
    vi.useRealTimers()
  })

  it('does nothing when no file is selected for home upload', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    const input = wrapper.find('input[type="file"]')
    await input.trigger('change')
    expect(mockFetch).not.toHaveBeenCalledWith('/api/admin/upload', expect.anything())
  })

  it('does nothing when no file is selected for cv upload', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    const input = wrapper.findAll('input[type="file"]')[1]
    await input.trigger('change')
    expect(mockFetch).not.toHaveBeenCalledWith('/api/admin/upload', expect.anything())
  })

  it('shows "Removal failed" when removePortrait rejection is not an Error', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    const deleteBtn = wrapper.find('button[title="Remove portrait"]')
    mockFetch.mockRejectedValue('string rejection')
    await deleteBtn.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Removal failed')
  })

  it('uses statusCode fallback when error has no response on load', async () => {
    const error = new Error('Fetch failed') as any
    delete error.response
    error.statusCode = 500
    mockFetch.mockRejectedValue(error)
    const wrapper = await mountSuspended(ProfileSection)
    await flushPromises()
    expect(wrapper.text()).toContain('Failed to load current portraits')
  })

  it('stops polling after 15 fetch errors in polling', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    const input = wrapper.find('input[type="file"]')

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(input.element, 'files', { value: [file] })

    let pollCount = 0
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/admin/upload') return Promise.resolve({ uploadUrl: 's3://url', s3Key: 'portraits/home.webp' })
      if (url === 's3://url') return Promise.resolve({})
      if (url === '/api/admin/profile') return Promise.resolve({})
      if (url.includes('/api/admin/image-status')) {
        pollCount++
        return Promise.reject(new Error('poll error'))
      }
      return Promise.resolve({})
    })

    await input.trigger('change')
    await flushPromises()

    for (let i = 0; i < 15; i++) {
      vi.advanceTimersByTime(2000)
      await flushPromises()
    }

    expect(pollCount).toBeGreaterThanOrEqual(15)
    vi.useRealTimers()
  })
})
