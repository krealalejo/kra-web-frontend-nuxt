const BTN = [
  'inline-flex items-center justify-center',
  'w-7 h-7 rounded text-sm',
  'text-gray-500 hover:text-gray-900',
  'dark:text-gray-400 dark:hover:text-gray-100',
  'hover:bg-gray-100 dark:hover:bg-gray-800',
  'transition-colors cursor-pointer select-none',
].join(' ')

const MIN_SCALE = 0.25
const MAX_SCALE = 4

function sanitizeDiagram(source: string): string {
  return source.replaceAll(/\|([^|"]+)\|/g, (match, label) =>
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

function getSvgNaturalWidth(svgEl: SVGElement): number {
  const w = svgEl.getAttribute('width')
  if (w && !w.endsWith('%')) return Number.parseFloat(w)
  const vb = svgEl.getAttribute('viewBox')
  if (vb) return Number.parseFloat(vb.split(' ')[2] ?? '0')
  return svgEl.getBoundingClientRect().width
}

function attachControls(wrapper: HTMLElement) {
  const viewport = wrapper.querySelector<HTMLElement>('.diagram-viewport')
  if (!viewport) return
  const svgEl = viewport.querySelector<SVGElement>('svg')
  if (!svgEl) return

  const naturalWidth = getSvgNaturalWidth(svgEl)
  let scale = 1

  const btnIn = wrapper.querySelector<HTMLButtonElement>('.btn-zoom-in')
  const btnOut = wrapper.querySelector<HTMLButtonElement>('.btn-zoom-out')

  function setDisabled(btn: HTMLButtonElement | null, disabled: boolean) {
    if (!btn) return
    btn.disabled = disabled
    btn.style.opacity = disabled ? '0.35' : ''
    btn.style.cursor = disabled ? 'not-allowed' : ''
    btn.style.pointerEvents = disabled ? 'none' : ''
  }

  function syncButtons() {
    setDisabled(btnIn, scale >= MAX_SCALE)
    setDisabled(btnOut, scale <= MIN_SCALE)
  }

  function applyZoom() {
    svgEl.style.width = `${naturalWidth * scale}px`
    svgEl.style.height = 'auto'
    syncButtons()
  }

  syncButtons()

  btnIn?.addEventListener('click', () => {
    scale = Math.min(+(scale + 0.25).toFixed(2), MAX_SCALE)
    applyZoom()
  })

  btnOut?.addEventListener('click', () => {
    scale = Math.max(+(scale - 0.25).toFixed(2), MIN_SCALE)
    applyZoom()
  })

  wrapper.querySelector('.btn-open')?.addEventListener('click', () => {
    const svgHtml = svgEl.outerHTML
    const blob = new Blob([svgHtml], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  })
}

function buildWrapper(svg: string, diagram: string): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'mermaid-diagram my-4'
  wrapper.dataset.source = diagram
  wrapper.innerHTML = `
    <div class="flex items-center justify-end gap-0.5 mb-1">
      <button class="${BTN} btn-zoom-out" title="Zoom out" aria-label="Zoom out">−</button>
      <button class="${BTN} btn-zoom-in" title="Zoom in" aria-label="Zoom in">+</button>
      <button class="${BTN} btn-open" title="Open in new tab" aria-label="Open in new tab">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        </svg>
      </button>
    </div>
    <div class="diagram-viewport overflow-auto rounded border border-gray-200 dark:border-gray-700 p-3">
      ${svg}
    </div>
  `
  attachControls(wrapper)
  return wrapper
}

async function renderDiagrams(container: HTMLElement | null | undefined) {
  if (import.meta.server || !container) return
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
      pre.replaceWith(buildWrapper(svg, diagram))
    } catch (e) {
      console.error('[useMermaid] render error', e)
      document.getElementById(id)?.remove()
    }
  }
}

async function reRender(container: HTMLElement | null | undefined) {
  if (import.meta.server || !container) return
  const wrappers = container.querySelectorAll<HTMLElement>('.mermaid-diagram')
  if (!wrappers.length) return

  const mermaid = await initMermaid()
  let counter = 0

  for (const wrapper of Array.from(wrappers)) {
    const diagram = wrapper.dataset.source
    if (!diagram) continue
    const viewport = wrapper.querySelector<HTMLElement>('.diagram-viewport')
    if (!viewport) continue
    const id = `mermaid-re-${Date.now()}-${counter++}`
    try {
      const { svg } = await mermaid.render(id, diagram)
      viewport.innerHTML = svg
      attachControls(wrapper)
    } catch (e) {
      console.error('[useMermaid] re-render error', e)
      document.getElementById(id)?.remove()
    }
  }
}

export function useMermaid() {
  return { renderDiagrams, reRender }
}

