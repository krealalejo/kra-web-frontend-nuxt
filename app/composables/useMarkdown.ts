import { marked } from 'marked'
import DOMPurify from 'dompurify'
import sanitizeHtml from 'sanitize-html'

export function useMarkdown() {
  function stripMarkdown(text: string): string {
    return text
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/\n{2,}/g, ' ')
      .trim()
  }

  function sanitizeMarkdown(text: string): string {
    const html = marked.parse(text) as string
    if (import.meta.server) {
      // Server: sanitize with allowlist so SSR payload is safe before hydration.
      // DOMPurify requires window/document and cannot run in the Node.js context.
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
