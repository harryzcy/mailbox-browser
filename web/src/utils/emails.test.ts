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

  it('url function in any case', () => {
    const result = makeCSSURL('https://proxy.com', 'URL(HTTPS://x.com/a.png)')
    expect(result).toBe(
      'url(https://proxy.com/proxy?l=HTTPS%3A%2F%2Fx.com%2Fa.png)'
    )
  })

  it('import with a string', () => {
    const result = makeCSSURL(
      'https://proxy.com',
      '@import "https://x.com/a.css"; @import url(https://x.com/b.css);'
    )
    expect(result).toBe(
      '@import url(https://proxy.com/proxy?l=https%3A%2F%2Fx.com%2Fa.css); @import url(https://proxy.com/proxy?l=https%3A%2F%2Fx.com%2Fb.css);'
    )
  })

  it('blocks remote urls', () => {
    const result = makeCSSURL(
      'https://proxy.com',
      '@import "https://x.com/a.css"; .a{background:url(https://x.com/b.png) no-repeat, url(data:image/png;base64,AA==)}',
      'block'
    )
    expect(result).toBe(
      '@import none; .a{background:none no-repeat, url(data:image/png;base64,AA==)}'
    )
  })

  it('leaves remote urls when loading directly', () => {
    const value = '.a{background:url(https://x.com/b.png)}'
    expect(makeCSSURL('https://proxy.com', value, 'direct')).toBe(value)
  })

  it("doesn't match", () => {
    const result = makeCSSURL(
      'https://proxy.com',
      'linear-gradient(#cc0000, #cc0000)'
    )
    expect(result).toBe('linear-gradient(#cc0000, #cc0000)')
  })
})
