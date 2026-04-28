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
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
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
    expect(svgWrapper?.innerHTML).toBe('<svg>mock-svg</svg>')
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
    container.appendChild(wrapper)

    await reRender(container)

    expect(consoleSpy).toHaveBeenCalledWith('[useMermaid] re-render error', expect.any(Error))
    consoleSpy.mockRestore()
  })
})
