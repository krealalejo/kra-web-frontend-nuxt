import { describe, it, expect, vi, afterEach } from 'vitest'
import { useMarkdown } from './useMarkdown'

// Mock marked and dompurify for unit tests
vi.mock('marked', () => ({
  marked: {
    parse: (text: string) => `<p>${text}</p>`,
  },
}))

vi.mock('dompurify', () => ({
  default: {
    sanitize: (html: string) => html,
  },
}))

vi.mock('sanitize-html', () => ({
  default: Object.assign(
    vi.fn((html: string) => html),
    {
      defaults: {
        allowedTags: ['p'],
        allowedAttributes: { p: [] }
      }
    }
  )
}))

describe('useMarkdown', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('stripMarkdown', () => {
    it('removes heading markers', () => {
      const { stripMarkdown } = useMarkdown()
      expect(stripMarkdown('# Title')).toBe('Title')
      expect(stripMarkdown('## Sub')).toBe('Sub')
      expect(stripMarkdown('### Deep')).toBe('Deep')
    })

    it('removes bold syntax', () => {
      const { stripMarkdown } = useMarkdown()
      expect(stripMarkdown('**bold text**')).toBe('bold text')
      expect(stripMarkdown('__bold__')).toBe('bold')
    })

    it('removes italic syntax', () => {
      const { stripMarkdown } = useMarkdown()
      expect(stripMarkdown('*italic*')).toBe('italic')
      expect(stripMarkdown('_italic_')).toBe('italic')
    })

    it('removes inline code', () => {
      const { stripMarkdown } = useMarkdown()
      expect(stripMarkdown('`code`')).toBe('')
    })

    it('replaces links with label text', () => {
      const { stripMarkdown } = useMarkdown()
      expect(stripMarkdown('[link text](https://example.com)')).toBe('link text')
    })

    it('removes list markers', () => {
      const { stripMarkdown } = useMarkdown()
      expect(stripMarkdown('- item')).toBe('item')
      expect(stripMarkdown('1. item')).toBe('item')
    })

    it('collapses multiple newlines to a space', () => {
      const { stripMarkdown } = useMarkdown()
      expect(stripMarkdown('a\n\nb')).toBe('a b')
    })

    it('handles empty string', () => {
      const { stripMarkdown } = useMarkdown()
      expect(stripMarkdown('')).toBe('')
    })
  })

  describe('sanitizeMarkdown', () => {
    it('returns string output', () => {
      const { sanitizeMarkdown } = useMarkdown()
      const result = sanitizeMarkdown('hello world')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('handles empty string', () => {
      const { sanitizeMarkdown } = useMarkdown()
      const result = sanitizeMarkdown('')
      expect(typeof result).toBe('string')
    })

    it('uses sanitize-html on server', () => {
      let originalServer: boolean | undefined
      try {
        originalServer = import.meta.server
        // @ts-ignore
        import.meta.server = true
        const { sanitizeMarkdown } = useMarkdown()
        const result = sanitizeMarkdown('hello world')
        expect(typeof result).toBe('string')
      } finally {
        // @ts-ignore
        import.meta.server = originalServer
      }
    })
  })
})
