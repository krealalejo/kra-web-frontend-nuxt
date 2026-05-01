export function useMarkdown() {
  function stripMarkdown(text: string): string {
    return text
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([\s\S]{1,2000}?)\*\*/g, '$1')
      .replace(/\*([\s\S]{1,2000}?)\*/g, '$1')
      .replace(/__([\s\S]{1,2000}?)__/g, '$1')
      .replace(/_([\s\S]{1,2000}?)_/g, '$1')
      .replace(/`{1,3}([^`]{0,2000})`{1,3}/g, '')
      .replace(/!\[([^\]]{0,2000})\]\([^)]{1,2000}\)/g, '')
      .replace(/\[([^\]]{1,2000})\]\([^)]{1,2000}\)/g, '$1')
      .replace(/^[ \t]{0,10}[-*+][ \t]{1,10}/gm, '')
      .replace(/^[ \t]{0,10}\d+\.[ \t]{1,10}/gm, '')
      .replace(/\n{2,}/g, ' ')
      .trim()
  }

  async function sanitizeMarkdown(text: string): Promise<string> {
    const { marked } = await import('marked')
    const renderer = new (marked as any).Renderer()
    renderer.heading = ({ text, depth }: any) => {
      const id = text.toLowerCase()
        .replace(/<[^>]*>?/gm, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-{1,200}|-{1,200}$/g, '')
      return `<h${depth} id="${id}">${text}</h${depth}>`
    }
    const html = await marked.parse(text, { renderer })
    if (process.server) {
      const { default: sanitizeHtml } = await import('sanitize-html')
      return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'title'],
          '*': ['class', 'id'],
        },
      })
    }
    const { default: DOMPurify } = await import('dompurify')
    return DOMPurify.sanitize(html, { ADD_ATTR: ['class', 'id'] })
  }

  function extractHeadings(text: string): { title: string; id: string }[] {
    const headings: { title: string; id: string }[] = []
    const lines = text.split('\n')
    for (const line of lines) {
      const match = line.match(/^##\s+(.{1,500})$/)
      if (match) {
        const rawTitle = match[1].trim()
        const title = stripMarkdown(rawTitle)
        const id = title.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-{1,200}|-{1,200}$/g, '')
        headings.push({ title, id })
      }
    }
    return headings
  }

  return { stripMarkdown, sanitizeMarkdown, extractHeadings }
}
