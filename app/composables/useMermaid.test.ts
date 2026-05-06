import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMermaid } from './useMermaid'

const mermaidRenderMock = vi.fn().mockResolvedValue({ svg: '<svg>mock-svg</svg>' })
const mermaidInitializeMock = vi.fn()

vi.mock('mermaid', () => ({
  default: {
    render: mermaidRenderMock,
    initialize: mermaidInitializeMock
  }
}))

describe('useMermaid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))
    document.body.innerHTML = ''
  })

  it('does nothing if no mermaid blocks are found', async () => {
    const { renderDiagrams } = useMermaid()
    const container = document.createElement('div')

    await renderDiagrams(container)

    expect(mermaidInitializeMock).not.toHaveBeenCalled()
  })

  it('renders diagrams when mermaid blocks are found', async () => {
    const { renderDiagrams } = useMermaid()
    const container = document.createElement('div')
    container.innerHTML = `
      <pre><code class="language-mermaid">graph TD; A-->B;</code></pre>
    `
    document.body.appendChild(container)

    await renderDiagrams(container)

    expect(mermaidInitializeMock).toHaveBeenCalled()
    expect(mermaidRenderMock).toHaveBeenCalled()

    const svgWrapper = container.querySelector('.mermaid-diagram')
    expect(svgWrapper).not.toBeNull()
    const viewport = svgWrapper?.querySelector('.diagram-viewport')
    expect(viewport?.innerHTML).toContain('<svg>mock-svg</svg>')
    expect(container.querySelector('pre')).toBeNull()
  })

  it('handles multiple diagrams', async () => {
    const { renderDiagrams } = useMermaid()
    const container = document.createElement('div')
    container.innerHTML = `
      <pre><code class="language-mermaid">diag 1</code></pre>
      <pre><code class="language-mermaid">diag 2</code></pre>
    `

    await renderDiagrams(container)

    expect(mermaidRenderMock).toHaveBeenCalledTimes(2)
    expect(container.querySelectorAll('.mermaid-diagram').length).toBe(2)
  })

  it('handles block without pre element', async () => {
    const { renderDiagrams } = useMermaid()
    const container = document.createElement('div')
    const code = document.createElement('code')
    code.className = 'language-mermaid'
    code.textContent = 'diag'
    container.appendChild(code)

    Object.defineProperty(code, 'parentElement', { get: () => null })

    await renderDiagrams(container)
    expect(mermaidRenderMock).not.toHaveBeenCalled()
  })

  it('handles null textContent', async () => {
    const { renderDiagrams } = useMermaid()
    const container = document.createElement('div')
    const pre = document.createElement('pre')
    const code = document.createElement('code')
    code.className = 'language-mermaid'
    Object.defineProperty(code, 'textContent', { get: () => null })
    pre.appendChild(code)
    container.appendChild(pre)

    await renderDiagrams(container)
    expect(mermaidRenderMock).toHaveBeenCalledWith(expect.any(String), '')
  })

  it('handles rendering errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
    mermaidRenderMock.mockRejectedValueOnce(new Error('Mermaid error'))

    const { renderDiagrams } = useMermaid()
    const container = document.createElement('div')
    container.innerHTML = '<pre><code class="language-mermaid">graph TD; A-->B;</code></pre>'

    await renderDiagrams(container)

    expect(consoleSpy).toHaveBeenCalledWith('[useMermaid] render error', expect.any(Error))
    expect(container.querySelector('pre')).not.toBeNull()

    consoleSpy.mockRestore()
  })

  it('initializes with dark theme if document has dark class', async () => {
    document.documentElement.classList.add('dark')

    const { renderDiagrams } = useMermaid()
    const container = document.createElement('div')
    container.innerHTML = '<pre><code class="language-mermaid">diag</code></pre>'

    await renderDiagrams(container)

    expect(mermaidInitializeMock).toHaveBeenCalledWith(expect.objectContaining({
      theme: 'dark'
    }))

    document.documentElement.classList.remove('dark')
  })

  it('reRender re-processes diagrams using stored source', async () => {
    const { renderDiagrams, reRender } = useMermaid()
    const container = document.createElement('div')
    container.innerHTML = '<pre><code class="language-mermaid">graph TD; A-->B;</code></pre>'

    await renderDiagrams(container)
    vi.clearAllMocks()

    document.documentElement.classList.add('dark')
    await reRender(container)

    expect(mermaidInitializeMock).toHaveBeenCalledWith(expect.objectContaining({
      theme: 'dark'
    }))
    expect(mermaidRenderMock).toHaveBeenCalledWith(
      expect.stringContaining('mermaid-re-'),
      expect.stringContaining('graph TD; A-->B;')
    )

    document.documentElement.classList.remove('dark')
  })

  it('reRender handles missing data-source gracefully', async () => {
    const { reRender } = useMermaid()
    const container = document.createElement('div')
    const wrapper = document.createElement('div')
    wrapper.className = 'mermaid-diagram'
    container.appendChild(wrapper)

    await reRender(container)
    expect(mermaidRenderMock).not.toHaveBeenCalled()
  })

  it('reRender handles rendering errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
    mermaidRenderMock.mockRejectedValueOnce(new Error('Mermaid re-render error'))

    const { reRender } = useMermaid()
    const container = document.createElement('div')
    const wrapper = document.createElement('div')
    wrapper.className = 'mermaid-diagram'
    wrapper.dataset.source = 'graph TD; A-->B;'
    const viewport = document.createElement('div')
    viewport.className = 'diagram-viewport'
    wrapper.appendChild(viewport)
    container.appendChild(wrapper)

    await reRender(container)

    expect(consoleSpy).toHaveBeenCalledWith('[useMermaid] re-render error', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('does nothing when renderDiagrams receives null container', async () => {
    const { renderDiagrams } = useMermaid()
    await renderDiagrams(null)
    expect(mermaidInitializeMock).not.toHaveBeenCalled()
  })

  it('does nothing when reRender receives null container', async () => {
    const { reRender } = useMermaid()
    await reRender(null)
    expect(mermaidInitializeMock).not.toHaveBeenCalled()
  })

  it('does nothing when reRender container has no .mermaid-diagram wrappers', async () => {
    const { reRender } = useMermaid()
    const container = document.createElement('div')
    container.innerHTML = '<p>no diagrams here</p>'
    await reRender(container)
    expect(mermaidInitializeMock).not.toHaveBeenCalled()
  })

  it('reRender skips wrapper without .diagram-viewport', async () => {
    const { renderDiagrams, reRender } = useMermaid()
    const container = document.createElement('div')
    container.innerHTML = '<pre><code class="language-mermaid">graph TD; A-->B;</code></pre>'
    await renderDiagrams(container)
    vi.clearAllMocks()

    const wrapper = container.querySelector('.mermaid-diagram') as HTMLElement
    const viewport = wrapper.querySelector('.diagram-viewport')
    viewport?.remove()

    await reRender(container)
    expect(mermaidRenderMock).not.toHaveBeenCalled()
  })

  it('sanitizeDiagram wraps pipe labels with special chars in quotes', async () => {
    const { renderDiagrams } = useMermaid()
    const container = document.createElement('div')
    container.innerHTML = '<pre><code class="language-mermaid">graph TD; A -->|has/slash| B</code></pre>'
    document.body.appendChild(container)
    await renderDiagrams(container)
    const called = mermaidRenderMock.mock.calls[0]?.[1] as string
    expect(called).toContain('|"has/slash"|')
  })

  it('sanitizeDiagram does not quote simple pipe labels', async () => {
    const { renderDiagrams } = useMermaid()
    const container = document.createElement('div')
    container.innerHTML = '<pre><code class="language-mermaid">graph TD; A -->|simple| B</code></pre>'
    document.body.appendChild(container)
    await renderDiagrams(container)
    const called = mermaidRenderMock.mock.calls[0]?.[1] as string
    expect(called).not.toContain('|"simple"|')
  })

  it('zoom in button increases SVG width', async () => {
    const { renderDiagrams } = useMermaid()
    const svgHtml = '<svg width="200" height="100"><rect /></svg>'
    mermaidRenderMock.mockResolvedValueOnce({ svg: svgHtml })
    const container = document.createElement('div')
    container.innerHTML = '<pre><code class="language-mermaid">graph TD; A-->B;</code></pre>'
    document.body.appendChild(container)
    await renderDiagrams(container)

    const svgEl = container.querySelector<SVGElement>('.diagram-viewport svg') as SVGElement
    const btnIn = container.querySelector<HTMLButtonElement>('.btn-zoom-in')
    await btnIn?.click()
    expect(svgEl.style.width).toBe('250px')
  })

  it('zoom out button decreases SVG width', async () => {
    const { renderDiagrams } = useMermaid()
    const svgHtml = '<svg width="200" height="100"><rect /></svg>'
    mermaidRenderMock.mockResolvedValueOnce({ svg: svgHtml })
    const container = document.createElement('div')
    container.innerHTML = '<pre><code class="language-mermaid">graph TD; A-->B;</code></pre>'
    document.body.appendChild(container)
    await renderDiagrams(container)

    const svgEl = container.querySelector<SVGElement>('.diagram-viewport svg') as SVGElement
    const btnOut = container.querySelector<HTMLButtonElement>('.btn-zoom-out')
    await btnOut?.click()
    expect(svgEl.style.width).toBe('150px')
  })

  it('zoom in is disabled when scale reaches MAX_SCALE', async () => {
    const { renderDiagrams } = useMermaid()
    const svgHtml = '<svg width="100" height="100"><rect /></svg>'
    mermaidRenderMock.mockResolvedValueOnce({ svg: svgHtml })
    const container = document.createElement('div')
    container.innerHTML = '<pre><code class="language-mermaid">graph TD; A-->B;</code></pre>'
    document.body.appendChild(container)
    await renderDiagrams(container)

    const btnIn = container.querySelector<HTMLButtonElement>('.btn-zoom-in')
    for (let i = 0; i < 15; i++) btnIn?.click()
    expect(btnIn?.disabled).toBe(true)
  })

  it('zoom out is disabled when scale reaches MIN_SCALE', async () => {
    const { renderDiagrams } = useMermaid()
    const svgHtml = '<svg width="100" height="100"><rect /></svg>'
    mermaidRenderMock.mockResolvedValueOnce({ svg: svgHtml })
    const container = document.createElement('div')
    container.innerHTML = '<pre><code class="language-mermaid">graph TD; A-->B;</code></pre>'
    document.body.appendChild(container)
    await renderDiagrams(container)

    const btnOut = container.querySelector<HTMLButtonElement>('.btn-zoom-out')
    for (let i = 0; i < 10; i++) btnOut?.click()
    expect(btnOut?.disabled).toBe(true)
  })

  it('open button creates a blob URL and opens new tab', async () => {
    const { renderDiagrams } = useMermaid()
    const svgHtml = '<svg width="100" height="100"><rect /></svg>'
    mermaidRenderMock.mockResolvedValueOnce({ svg: svgHtml })

    const createObjectURL = vi.fn().mockReturnValue('blob:fake-url')
    const revokeObjectURL = vi.fn()
    const windowOpen = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    vi.stubGlobal('open', windowOpen)

    const container = document.createElement('div')
    container.innerHTML = '<pre><code class="language-mermaid">graph TD; A-->B;</code></pre>'
    document.body.appendChild(container)
    await renderDiagrams(container)

    const btnOpen = container.querySelector<HTMLButtonElement>('.btn-open')
    btnOpen?.click()

    expect(createObjectURL).toHaveBeenCalled()
    expect(windowOpen).toHaveBeenCalledWith('blob:fake-url', '_blank')
  })

  it('getSvgNaturalWidth uses viewBox when width ends with %', async () => {
    const { renderDiagrams } = useMermaid()
    const svgHtml = '<svg width="100%" viewBox="0 0 400 200"><rect /></svg>'
    mermaidRenderMock.mockResolvedValueOnce({ svg: svgHtml })
    const container = document.createElement('div')
    container.innerHTML = '<pre><code class="language-mermaid">graph TD; A-->B;</code></pre>'
    document.body.appendChild(container)
    await renderDiagrams(container)

    const btnIn = container.querySelector<HTMLButtonElement>('.btn-zoom-in')
    btnIn?.click()
    const svgEl = container.querySelector<SVGElement>('.diagram-viewport svg') as SVGElement
    expect(svgEl.style.width).toBe('500px')
  })

  it('getSvgNaturalWidth uses getBoundingClientRect when no width or viewBox', async () => {
    const { renderDiagrams } = useMermaid()
    const svgHtml = '<svg><rect /></svg>'
    mermaidRenderMock.mockResolvedValueOnce({ svg: svgHtml })
    const container = document.createElement('div')
    container.innerHTML = '<pre><code class="language-mermaid">graph TD; A-->B;</code></pre>'
    document.body.appendChild(container)
    await renderDiagrams(container)

    const btnIn = container.querySelector<HTMLButtonElement>('.btn-zoom-in')
    btnIn?.click()
    const svgEl = container.querySelector<SVGElement>('.diagram-viewport svg') as SVGElement
    expect(svgEl.style.width).toBeDefined()
  })
})
