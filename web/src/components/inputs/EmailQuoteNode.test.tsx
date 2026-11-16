import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { EmailQuote } from './EmailQuoteNode'

vi.mock('html-react-parser', async (importOriginal) => ({
  ...(await importOriginal<typeof import('html-react-parser')>()),
  default: () => {
    throw new Error('parse failed')
  }
}))

afterEach(cleanup)

test('shows a fallback when the quoted email fails to render', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  render(<EmailQuote html="<p>Hello</p>" />)
  expect(screen.getByText('Rendering failed')).toBeTruthy()
})
