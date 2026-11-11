import { describe, expect, it } from 'vitest'

import { exportedForTesting, parseEmailName } from './emails'

describe('parseEmailName', () => {
  it('simple case', () => {
    const result = parseEmailName(['FirstName <foo@example.com>'])
    expect(result.name).toBe('FirstName')
    expect(result.address).toBe('foo@example.com')
  })

  it('multiple space', () => {
    const result = parseEmailName(['FirstName  \u003Cfoo@example.com\u003E'])
    expect(result.name).toBe('FirstName')
    expect(result.address).toBe('foo@example.com')
  })

  it('trim space', () => {
    const result = parseEmailName(['< foo@example.com >  '])
    expect(result.name).toBeNull()
    expect(result.address).toBe('foo@example.com')
  })

  it('without name, always address', () => {
    const result = parseEmailName(['<foo@example.com>'])
    expect(result.name).toBeNull()
    expect(result.address).toBe('foo@example.com')
  })
})

const { makeCSSURL } = exportedForTesting

describe('makeCSSURL', () => {
  it('should return a string', () => {
    const result = makeCSSURL('https://proxy.com', 'test')
    expect(typeof result).toBe('string')
  })

  it('arbitrary value without url function', () => {
    const result = makeCSSURL('https://proxy.com', 'test')
    expect(result).toBe('test')
  })

  it('url function with no quotes', () => {
    const result = makeCSSURL(
      'https://proxy.com',
      'url(https://example.com/image.png)'
    )
    expect(result).toBe(
      'url(https://proxy.com/proxy?l=https%3A%2F%2Fexample.com%2Fimage.png)'
    )
  })

  it('url function with single quotes', () => {
    const result = makeCSSURL(
      'https://proxy.com',
      "url('https://example.com/image.png')"
    )
    expect(result).toBe(
      'url(https://proxy.com/proxy?l=https%3A%2F%2Fexample.com%2Fimage.png)'
    )
  })

  it('url function with double quotes', () => {
    const result = makeCSSURL(
      'https://proxy.com',
      'url("https://example.com/image.png")'
    )
    expect(result).toBe(
      'url(https://proxy.com/proxy?l=https%3A%2F%2Fexample.com%2Fimage.png)'
    )
  })

  it('url function with spaces', () => {
    const result = makeCSSURL(
      'https://proxy.com',
      'url( https://example.com/image.png )'
    )
    expect(result).toBe(
      'url(https://proxy.com/proxy?l=https%3A%2F%2Fexample.com%2Fimage.png)'
    )
  })

  it('multiple url functions', () => {
    const result = makeCSSURL(
      'https://proxy.com',
      'url(https://example.com/image.png) url(https://example.com/image2.png)'
    )
    expect(result).toBe(
      'url(https://proxy.com/proxy?l=https%3A%2F%2Fexample.com%2Fimage.png) url(https://proxy.com/proxy?l=https%3A%2F%2Fexample.com%2Fimage2.png)'
    )
  })

  it('url function with data uri', () => {
    const result = makeCSSURL(
      'https://proxy.com',
      'data://image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wr+9OAAAAABJRU5ErkJggg=='
    )
    expect(result).toBe(
      'data://image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wr+9OAAAAABJRU5ErkJggg=='
    )
  })

  it("doesn't match", () => {
    const result = makeCSSURL(
      'https://proxy.com',
      'linear-gradient(#cc0000, #cc0000)'
    )
    expect(result).toBe('linear-gradient(#cc0000, #cc0000)')
  })
})

const { transformCss } = exportedForTesting

describe('transformCss', () => {
  const host = 'https://proxy.com'

  it('scopes each selector to the sandbox', () => {
    expect(transformCss(host, '.a, p > span { color: red }')).toBe(
      '.email-sandbox .a, .email-sandbox p > span { color: red }'
    )
  })

  it('keeps selectors already scoped to the sandbox', () => {
    expect(transformCss(host, '.email-sandbox .a{}')).toBe(
      '.email-sandbox .a{}'
    )
  })

  it('scopes rules inside at-rules', () => {
    expect(
      transformCss(
        host,
        '@media (max-width: 600px) { @supports (x: y) { .a{} } }'
      )
    ).toBe(
      '@media (max-width: 600px) { @supports (x: y) { .email-sandbox .a{} } }'
    )
  })

  it('leaves keyframe and nested selectors alone', () => {
    expect(
      transformCss(
        host,
        '@-webkit-keyframes k{from{}to{}} .a{ &:hover{} .b{} }'
      )
    ).toBe(
      '@-webkit-keyframes k{from{}to{}} .email-sandbox .a{ &:hover{} .b{} }'
    )
  })

  it('proxies remote urls', () => {
    expect(
      transformCss(
        host,
        '@font-face{src:url(https://x.com/f.woff)} .a{background-image:url("http://x.com/i.png");color:red}'
      )
    ).toBe(
      '@font-face{src:url(https://proxy.com/proxy?l=https%3A%2F%2Fx.com%2Ff.woff)} .email-sandbox .a{background-image:url(https://proxy.com/proxy?l=http%3A%2F%2Fx.com%2Fi.png);color:red}'
    )
  })

  it('ignores html comment markers', () => {
    expect(transformCss(host, '<!--\n.a{}\n-->')).toBe(
      '\n.email-sandbox .a{}\n'
    )
    expect(transformCss(host, ' <!-- .a{content:"-->"} --> ')).toBe(
      ' .email-sandbox .a{content:"-->"} '
    )
  })

  it('drops css that fails to parse', () => {
    expect(transformCss(host, '.a{color:red')).toBe('')
    expect(transformCss(host, '.a{color red}')).toBe('')
  })

  it('handles long runs of missing semicolons', () => {
    const start = performance.now()
    expect(transformCss(host, 'p{' + 'a:b '.repeat(50000) + '}')).toBe('')
    expect(performance.now() - start).toBeLessThan(1000)
  })
})
