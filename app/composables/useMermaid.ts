export function useMermaid() {
  async function renderDiagrams(container: HTMLElement) {
    if (import.meta.server) return
    const blocks = container.querySelectorAll('pre code.language-mermaid')
    if (!blocks.length) return

    const { default: mermaid } = await import('mermaid')
    const isDark = document.documentElement.classList.contains('dark')
    mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'default' })

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
        wrapper.dataset.source = diagram // Store original code for re-renders
        wrapper.innerHTML = svg
        pre.replaceWith(wrapper)
      } catch (e) {
        console.error('[useMermaid] render error', e)
      }
    }
  }

  async function reRender(container: HTMLElement) {
    if (import.meta.server) return
    const wrappers = container.querySelectorAll('.mermaid-diagram')
    if (!wrappers.length) return

    const { default: mermaid } = await import('mermaid')
    const isDark = document.documentElement.classList.contains('dark')
    // We must re-initialize for the theme change to take effect in render()
    mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'default' })

    let counter = 0
    for (const wrapper of Array.from(wrappers) as HTMLElement[]) {
      const diagram = wrapper.dataset.source
      if (!diagram) continue
      const id = `mermaid-re-${Date.now()}-${counter++}`
      try {
        const { svg } = await mermaid.render(id, diagram)
        wrapper.innerHTML = svg
      } catch (e) {
        console.error('[useMermaid] re-render error', e)
      }
    }
  }

  return { renderDiagrams, reRender }
}
