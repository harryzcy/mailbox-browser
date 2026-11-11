import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import { type Email } from 'services/emails'

import { EmailContent } from 'utils/emails'

import { EmailSandbox } from './EmailSandbox'

afterEach(cleanup)

function renderEmail(
  html: string,
  {
    loadImage = true,
    disableProxy = false
  }: { loadImage?: boolean; disableProxy?: boolean } = {}
) {
  const { container } = render(
    <EmailSandbox>
      <EmailContent
        email={{ html } as Email}
        loadImage={loadImage}
        disableProxy={disableProxy}
      />
    </EmailSandbox>
  )
  const host = container.firstElementChild?.firstElementChild
  if (!host?.shadowRoot) throw new Error('email not rendered in a shadow root')
  return { container, shadowRoot: host.shadowRoot }
}

describe('EmailSandbox', () => {
  test('renders the email inside a shadow root', () => {
    const { container, shadowRoot } = renderEmail(
      '<style>p{color:red}</style><p>Hello</p>'
    )
    expect(shadowRoot.querySelector('p')?.textContent).toBe('Hello')
    expect(container.querySelector('p')).toBeNull()
  })

  test("adds default styles before the email's own", () => {
    const { shadowRoot } = renderEmail(
      '<style>img{max-width:none}</style><p>Hello</p>'
    )
    const styles = [...shadowRoot.querySelectorAll('style')].map(
      (style) => style.textContent
    )
    expect(styles).toEqual([
      'img{max-width:100%;height:auto}',
      'img{max-width:none}'
    ])
  })

  test('proxies urls in style blocks', () => {
    const { shadowRoot } = renderEmail(
      '<style>@import "https://x.com/a.css"; .a{background:URL(https://x.com/b.png)}</style><p>Hello</p>'
    )
    const css = shadowRoot.querySelectorAll('style')[1].textContent
    expect(css).toMatch(
      /^@import url\(\S+\/proxy\?l=https%3A%2F%2Fx\.com%2Fa\.css\); \.a\{background:url\(\S+\/proxy\?l=https%3A%2F%2Fx\.com%2Fb\.png\)\}$/u
    )
  })

  test('blocks remote css resources when images are hidden', () => {
    const { shadowRoot } = renderEmail(
      '<style>.a{background:url(https://x.com/a.png)}</style><p style="background:url(https://x.com/b.png)">Hello</p>',
      { loadImage: false }
    )
    expect(shadowRoot.querySelectorAll('style')[1].textContent).toBe(
      '.a{background:none}'
    )
    const inline = shadowRoot.querySelector('p')!.getAttribute('style')
    expect(inline).toContain('none')
    expect(inline).not.toContain('x.com')
  })

  test('loads css resources directly when the proxy is disabled', () => {
    const { shadowRoot } = renderEmail(
      '<style>.a{background:url(https://x.com/a.png)}</style><p>Hello</p>',
      { disableProxy: true }
    )
    expect(shadowRoot.querySelectorAll('style')[1].textContent).toBe(
      '.a{background:url(https://x.com/a.png)}'
    )
  })

  test('drops tags React would move into the document head', () => {
    const { shadowRoot } = renderEmail(
      '<head><meta http-equiv="refresh" content="0;url=https://x.com"><link rel="stylesheet" href="https://x.com/a.css" precedence="high"></head><p>Hello</p>'
    )
    expect(document.head.querySelector('meta[http-equiv]')).toBeNull()
    expect(document.head.querySelector('link')).toBeNull()
    expect(shadowRoot.querySelector('meta, link')).toBeNull()
  })
})
