function sanitizeDiagram(source: string): string {
  return source.replace(/\|([^|"]+)\|/g, (match, label) =>
    /[/()[\]{}]/.test(label) ? `|"${label}"|` : match
  )
}

async function initMermaid() {
  const { default: mermaid } = await import('mermaid')
  mermaid.initialize({
    startOnLoad: false,
    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
  })
  return mermaid
}

export function useMermaid() {
  async function renderDiagrams(container: HTMLElement) {
    if (import.meta.server) return
    const blocks = container.querySelectorAll('pre code.language-mermaid')
    if (!blocks.length) return

    const mermaid = await initMermaid()
    let counter = 0

    for (const block of Array.from(blocks)) {
      const pre = block.parentElement
      if (!pre) continue
      const diagram = sanitizeDiagram(block.textContent ?? '')
      const id = `mermaid-${Date.now()}-${counter++}`
      try {
        const { svg } = await mermaid.render(id, diagram)
        const wrapper = document.createElement('div')
        wrapper.className = 'mermaid-diagram my-4 overflow-x-auto'
        wrapper.dataset.source = diagram
        wrapper.innerHTML = svg
        pre.replaceWith(wrapper)
      } catch (e) {
        console.error('[useMermaid] render error', e)
        document.getElementById(id)?.remove()
      }
    }
  }

  async function reRender(container: HTMLElement) {
    if (import.meta.server) return
    const wrappers = container.querySelectorAll<HTMLElement>('.mermaid-diagram')
    if (!wrappers.length) return

    const mermaid = await initMermaid()
    let counter = 0

    for (const wrapper of Array.from(wrappers)) {
      const diagram = wrapper.dataset.source
      if (!diagram) continue
      const id = `mermaid-re-${Date.now()}-${counter++}`
      try {
        const { svg } = await mermaid.render(id, diagram)
        wrapper.innerHTML = svg
      } catch (e) {
        console.error('[useMermaid] re-render error', e)
        document.getElementById(id)?.remove()
      }
    }
  }

  return { renderDiagrams, reRender }
}
