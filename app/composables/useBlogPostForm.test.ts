import { describe, it, expect } from 'vitest'
import { blogPostSchema } from './useBlogPostForm'

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
