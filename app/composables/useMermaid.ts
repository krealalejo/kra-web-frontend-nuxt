export function useMermaid() {
  async function renderDiagrams(container: HTMLElement) {
    if (import.meta.server) return
    const blocks = container.querySelectorAll('pre code.language-mermaid')
    if (!blocks.length) return

    const { default: mermaid } = await import('mermaid')
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'default' })

    let counter = 0
    for (const block of Array.from(blocks)) {
      const pre = block.parentElement
      if (!pre) continue
      const diagram = block.textContent ?? ''
      const id = `mermaid-${Date.now()}-${counter++}`
      try {
        const { svg } = await mermaid.render(id, diagram)
        const wrapper = document.createElement('div')
        wrapper.className = 'mermaid-diagram my-4 overflow-x-auto'
        wrapper.innerHTML = svg
        pre.replaceWith(wrapper)
      } catch (e) {
        console.error('[useMermaid] render error', e)
      }
    }
  }

  return { renderDiagrams }
}
