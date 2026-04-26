import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import ProfileSection from './ProfileSection.vue'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('ProfileSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      homePortraitUrl: 'images/home.jpg',
      cvPortraitUrl: 'images/cv.jpg'
    })
  })

  it('renders both portrait previews when data is available', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    
    const imgs = wrapper.findAll('img')
    expect(imgs.length).toBe(2)
    expect(imgs[0].attributes('src')).toContain('thumbnails/home-thumb.webp')
    expect(imgs[1].attributes('src')).toContain('thumbnails/cv-thumb.webp')
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
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }) // 6MB
    Object.defineProperty(input.element, 'files', { value: [file] })
    
    await input.trigger('change')
    expect(wrapper.text()).toContain('Image must be smaller than 5 MB')
  })

  it('performs full upload flow for home portrait', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    const input = wrapper.find('input[type="file"]')
    
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(input.element, 'files', { value: [file] })
    
    mockFetch.mockImplementation((url) => {
      if (url === '/api/admin/upload') return Promise.resolve({ uploadUrl: 's3://url', s3Key: 'images/new-home.jpg' })
      if (url === 's3://url') return Promise.resolve({})
      if (url === '/api/admin/profile') return Promise.resolve({})
      return Promise.resolve({})
    })
    
    await input.trigger('change')
    
    // Check if thumbnail updated (need a few ticks for reactive changes)
    await nextTick()
    await nextTick()
    
    const img = wrapper.find('img[alt="Home portrait"]')
    expect(img.attributes('src')).toContain('thumbnails/new-home-thumb.webp')
  })

  it('performs full upload flow for CV portrait', async () => {
    const wrapper = await mountSuspended(ProfileSection)
    const input = wrapper.findAll('input[type="file"]')[1] // CV input
    
    const file = new File([''], 'test-cv.jpg', { type: 'image/jpeg' })
    Object.defineProperty(input.element, 'files', { value: [file] })
    
    mockFetch.mockImplementation((url) => {
      if (url === '/api/admin/upload') return Promise.resolve({ uploadUrl: 's3://cv-url', s3Key: 'images/new-cv.jpg' })
      if (url === 's3://cv-url') return Promise.resolve({})
      if (url === '/api/admin/profile') return Promise.resolve({})
      return Promise.resolve({})
    })
    
    await input.trigger('change')
    
    await nextTick()
    await nextTick()
    
    const img = wrapper.find('img[alt="CV portrait"]')
    expect(img.attributes('src')).toContain('thumbnails/new-cv-thumb.webp')
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
})
