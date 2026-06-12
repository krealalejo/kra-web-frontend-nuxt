import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve(process.cwd(), 'app/assets/css/design-system.css'), 'utf-8')

describe('design-system.css — mobile overflow guards', () => {
  it('body uses overflow-x: clip (not hidden) to avoid creating a scroll container that breaks position:sticky', () => {
    const body = css.match(/body\s*\{[^}]*\}/)?.[0] ?? ''
    expect(body).toMatch(/overflow-x:\s*clip/)
    expect(body).not.toMatch(/overflow-x:\s*hidden/)
  })

  it('html clips horizontal overflow', () => {
    const html = css.match(/html\s*\{[^}]*\}/)?.[0] ?? ''
    expect(html).toMatch(/overflow-x:\s*hidden/)
  })

  it('scales down .cv-head h1 on small screens so the name fits the viewport', () => {
    const smallScreen = css.match(/@media\s*\(max-width:\s*560px\)\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(smallScreen).toMatch(/\.cv-head h1\s*\{[^}]*font-size:\s*clamp\(40px,\s*12vw,\s*56px\)/)
  })
})

describe('design-system.css — project detail sticky sidebar', () => {
  it('.pd-sidebar has position:sticky so it stays fixed on scroll', () => {
    const rule = css.match(/\.pd-sidebar\s*\{[^}]*\}/)?.[0] ?? ''
    expect(rule).toMatch(/position:\s*sticky/)
  })

  it('.pd-sidebar has a top offset so it clears the fixed nav', () => {
    const rule = css.match(/\.pd-sidebar\s*\{[^}]*\}/)?.[0] ?? ''
    expect(rule).toMatch(/top:\s*\d+px/)
  })

  it('.pd-body sets align-items:flex-start so sidebar column does not stretch to full height', () => {
    const rule = css.match(/\.pd-body\s*\{[^}]*\}/)?.[0] ?? ''
    expect(rule).toMatch(/align-items:\s*(flex-start|start)/)
  })
})
