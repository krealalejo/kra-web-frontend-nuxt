import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { blogPostSchema, useBlogPostForm } from './useBlogPostForm'

vi.mock('vee-validate', () => ({
  useForm: vi.fn(() => ({
    isSubmitting: ref(false),
    handleSubmit: vi.fn(),
    resetForm: vi.fn(),
    setValues: vi.fn(),
  })),
  useField: vi.fn((name: string) => ({
    value: ref(''),
    errorMessage: ref(undefined),
    _name: name,
  })),
}))

vi.mock('@vee-validate/zod', () => ({
  toTypedSchema: vi.fn((schema: unknown) => schema),
}))

describe('blogPostSchema', () => {
  describe('slug validation', () => {
    it('accepts valid lowercase alphanumeric with hyphens', () => {
      const result = blogPostSchema.safeParse({
        slug: 'my-post-123',
        title: 'Valid Title',
        content: 'Content',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty slug', () => {
      const result = blogPostSchema.safeParse({
        slug: '',
        title: 'Title',
        content: 'Content',
      })
      expect(result.success).toBe(false)
    })

    it('rejects uppercase letters', () => {
      const result = blogPostSchema.safeParse({
        slug: 'My-Post',
        title: 'Title',
        content: 'Content',
      })
      expect(result.success).toBe(false)
    })

    it('rejects spaces', () => {
      const result = blogPostSchema.safeParse({
        slug: 'my post',
        title: 'Title',
        content: 'Content',
      })
      expect(result.success).toBe(false)
    })

    it('rejects underscores', () => {
      const result = blogPostSchema.safeParse({
        slug: 'my_post',
        title: 'Title',
        content: 'Content',
      })
      expect(result.success).toBe(false)
    })

    it('rejects slug exceeding 128 characters', () => {
      const result = blogPostSchema.safeParse({
        slug: 'a'.repeat(129),
        title: 'Title',
        content: 'Content',
      })
      expect(result.success).toBe(false)
    })

    it('accepts slug with exactly 128 characters', () => {
      const result = blogPostSchema.safeParse({
        slug: 'a'.repeat(128),
        title: 'Title',
        content: 'Content',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('title validation', () => {
    it('accepts valid title', () => {
      const result = blogPostSchema.safeParse({
        slug: 'post',
        title: 'My Blog Post Title',
        content: 'Content',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty title', () => {
      const result = blogPostSchema.safeParse({
        slug: 'post',
        title: '',
        content: 'Content',
      })
      expect(result.success).toBe(false)
    })

    it('rejects title exceeding 256 characters', () => {
      const result = blogPostSchema.safeParse({
        slug: 'post',
        title: 'a'.repeat(257),
        content: 'Content',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('content validation', () => {
    it('accepts empty content', () => {
      const result = blogPostSchema.safeParse({
        slug: 'post',
        title: 'Title',
        content: '',
      })
      expect(result.success).toBe(true)
    })

    it('rejects content exceeding 200000 characters', () => {
      const result = blogPostSchema.safeParse({
        slug: 'post',
        title: 'Title',
        content: 'a'.repeat(200001),
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('blogPostSchema references', () => {
  it('accepts valid references array', () => {
    const result = blogPostSchema.safeParse({
      slug: 'my-post',
      title: 'My Title',
      content: 'Hello',
      references: [{ label: 'MDN', url: 'https://developer.mozilla.org' }],
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty references', () => {
    const result = blogPostSchema.safeParse({
      slug: 'my-post',
      title: 'My Title',
      content: 'Hello',
      references: [],
    })
    expect(result.success).toBe(true)
  })

  it('rejects references with invalid url', () => {
    const result = blogPostSchema.safeParse({
      slug: 'my-post',
      title: 'My Title',
      content: 'Hello',
      references: [{ label: 'Bad', url: 'not-a-url' }],
    })
    expect(result.success).toBe(false)
  })

  it('accepts absent references (defaults to empty array)', () => {
    const result = blogPostSchema.safeParse({
      slug: 'my-post',
      title: 'My Title',
      content: 'Hello',
    })
    expect(result.success).toBe(true)
  })
})

describe('useBlogPostForm', () => {
  it('returns field bindings with default empty values', () => {
    const form = useBlogPostForm()
    expect(form.slug).toBeDefined()
    expect(form.title).toBeDefined()
    expect(form.content).toBeDefined()
    expect(form.slugError).toBeDefined()
    expect(form.titleError).toBeDefined()
    expect(form.contentError).toBeDefined()
  })

  it('exposes handleSubmit, resetForm, setValues, and isSubmitting', () => {
    const form = useBlogPostForm()
    expect(typeof form.handleSubmit).toBe('function')
    expect(typeof form.resetForm).toBe('function')
    expect(typeof form.setValues).toBe('function')
    expect(form.isSubmitting).toBeDefined()
  })

  it('accepts partial initial values without error', () => {
    const form = useBlogPostForm({ initialValues: { slug: 'my-post', title: 'My Title' } })
    expect(form.slug).toBeDefined()
    expect(form.title).toBeDefined()
  })

  it('works with no options argument', () => {
    const form = useBlogPostForm()
    expect(form).toBeDefined()
  })
})
