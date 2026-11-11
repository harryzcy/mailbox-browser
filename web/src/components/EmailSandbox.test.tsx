import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import { parseEmailHTML } from 'utils/emails'

import { EmailSandbox } from './EmailSandbox'

afterEach(cleanup)

function renderEmail(html: string) {
  const { container } = render(
    <EmailSandbox>{parseEmailHTML(html)}</EmailSandbox>
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
    expect(shadowRoot.querySelector('style')?.textContent).toBe('p{color:red}')
    expect(container.querySelector('p')).toBeNull()
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
