import { marked } from 'marked'
import DOMPurify from 'dompurify'

export function useMarkdown() {
  function stripMarkdown(text: string): string {
    return text
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\[([^\]]{1,500})\]\([^)]{0,1000}\)/g, '$1')
      .replace(/!\[([^\]]{0,500})\]\([^)]{0,1000}\)/g, '')
      .replace(/^[ \t]*[-*+][ \t]+/gm, '')
      .replace(/^[ \t]*\d+\.[ \t]+/gm, '')
      .replace(/\n{2,}/g, ' ')
      .trim()
  }

  function sanitizeMarkdown(text: string): string {
    const html = marked.parse(text) as string
    if (import.meta.server) return html
    return DOMPurify.sanitize(html)
  }

  return { stripMarkdown, sanitizeMarkdown }
}
