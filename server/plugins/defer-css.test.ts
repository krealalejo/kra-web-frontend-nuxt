import { describe, it, expect, vi } from 'vitest'

vi.stubGlobal('defineNitroPlugin', (fn: Function) => fn)

describe('server/plugins/defer-css', () => {
  it('replaces stylesheet links with preload pattern', async () => {
    const mod = await import('./defer-css')
    const plugin = mod.default as Function

    const mockHtml = {
      head: [
        '<link rel="stylesheet" href="/_nuxt/entry.abc123.css">',
        '<link rel="stylesheet" href="/_nuxt/chunk.def456.css" crossorigin>',
        '<link rel="icon" href="/favicon.ico">',
      ],
    }

    const capturedHooks: Record<string, Function> = {}
    const nitroApp = {
      hooks: {
        hook: (event: string, cb: Function) => {
          capturedHooks[event] = cb
        },
      },
    }

    plugin(nitroApp)
    capturedHooks['render:html']!(mockHtml)

    expect(mockHtml.head[0]).toContain('rel="preload"')
    expect(mockHtml.head[0]).toContain('as="style"')
    expect(mockHtml.head[0]).toContain("this.rel='stylesheet'")
    expect(mockHtml.head[0]).toContain('<noscript>')
    expect(mockHtml.head[1]).toContain('rel="preload"')
    expect(mockHtml.head[2]).toBe('<link rel="icon" href="/favicon.ico">')
  })
})
