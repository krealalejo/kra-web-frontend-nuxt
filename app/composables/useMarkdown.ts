import { marked } from 'marked'
import DOMPurify from 'dompurify'

export function useMarkdown() {
  function stripMarkdown(text: string): string {
    return text
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([\s\S]{1,2000}?)\*\*/g, '$1')
      .replace(/\*([\s\S]{1,2000}?)\*/g, '$1')
      .replace(/__([\s\S]{1,2000}?)__/g, '$1')
      .replace(/_([\s\S]{1,2000}?)_/g, '$1')
      .replace(/`{1,3}([^`]{0,2000})`{1,3}/g, '')
      .replace(/\[([^\]]{1,2000})\]\([^)]{1,2000}\)/g, '$1')
      .replace(/!\[([^\]]{0,2000})\]\([^)]{1,2000}\)/g, '')
      .replace(/^[ \t]{0,10}[-*+][ \t]{1,10}/gm, '')
      .replace(/^[ \t]{0,10}\d+\.[ \t]{1,10}/gm, '')
      .replace(/\n{2,}/g, ' ')
      .trim()
  }

  async function sanitizeMarkdown(text: string): Promise<string> {
    const html = await marked.parse(text)
    if (import.meta.server) {
      const { default: sanitizeHtml } = await import('sanitize-html')
      return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'title'],
        },
      })
    }
    return DOMPurify.sanitize(html)
  }

  return { stripMarkdown, sanitizeMarkdown }
}
