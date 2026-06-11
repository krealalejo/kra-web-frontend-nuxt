import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve(process.cwd(), 'app/assets/css/design-system.css'), 'utf-8')

/**
 * Layout regression guards. happy-dom has no layout engine, so media-query
 * and overflow behaviour cannot be asserted via component mount — these read
 * the stylesheet directly to prevent the mobile horizontal-scroll bug from
 * silently regressing if the rules are removed.
 */
describe('design-system.css — mobile overflow guards', () => {
  it('body clips horizontal overflow (iOS Safari scroll container)', () => {
    const body = css.match(/body\s*\{[^}]*\}/)?.[0] ?? ''
    expect(body).toMatch(/overflow-x:\s*hidden/)
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
