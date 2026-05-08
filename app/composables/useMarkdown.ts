function stripMarkdown(text: string): string {
  return text
    .replaceAll(/^#{1,6}\s+/gm, '')
    .replaceAll(/\*\*([\s\S]{1,2000}?)\*\*/g, '$1')
    .replaceAll(/\*([\s\S]{1,2000}?)\*/g, '$1')
    .replaceAll(/__([\s\S]{1,2000}?)__/g, '$1')
    .replaceAll(/_([\s\S]{1,2000}?)_/g, '$1')
    .replaceAll(/`{1,3}([^`]{0,2000})`{1,3}/g, '')
    .replaceAll(/!\[([^\]]{0,2000})\]\([^)]{1,2000}\)/g, '')
    .replaceAll(/\[([^\]]{1,2000})\]\([^)]{1,2000}\)/g, '$1')
    .replaceAll(/^[ \t]{0,10}[-*+][ \t]{1,10}/gm, '')
    .replaceAll(/^[ \t]{0,10}\d+\.[ \t]{1,10}/gm, '')
    .replaceAll(/\n{2,}/g, ' ')
    .trim()
}

async function sanitizeMarkdown(text: string): Promise<string> {
  const { marked } = await import('marked')
  const renderer = new (marked as any).Renderer()
  renderer.heading = ({ text, depth }: any) => {
    const id = text.toLowerCase()
      .replaceAll(/<[^>]*>?/gm, '')
      .replaceAll(/[^\w\s-]/g, '')
      .replaceAll(/[\s_-]+/g, '-')
      .replaceAll(/^-{1,200}|-{1,200}$/g, '')
    return `<h${depth} id="${id}">${text}</h${depth}>`
  }
  const html = await marked.parse(text, { renderer })
  /* v8 ignore next 10 */
  if (import.meta.server) {
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
    const match = /^##\s+(.{1,500})$/.exec(line)
    if (match) {
      const rawTitle = match[1].trim()
      const title = stripMarkdown(rawTitle)
      const id = title.toLowerCase()
        .replaceAll(/[^\w\s-]/g, '')
        .replaceAll(/[\s_-]+/g, '-')
        .replaceAll(/^-{1,200}|-{1,200}$/g, '')
      headings.push({ title, id })
    }
  }
  return headings
}

export function useMarkdown() {
  return { stripMarkdown, sanitizeMarkdown, extractHeadings }
}
