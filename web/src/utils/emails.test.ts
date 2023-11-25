import { exportedForTesting, getNameFromEmails } from './emails'

describe('getNameFromEmails', () => {
  it('simple case', () => {
    const result = getNameFromEmails(['FirstName <foo@example.com>'], true)
    expect(result).toBe('FirstName <foo@example.com>')
  })

  it('multiple space', () => {
    const result = getNameFromEmails(
      ['FirstName  \u003cfoo@example.com\u003e'],
      true
    )
    expect(result).toBe('FirstName <foo@example.com>')
  })

  it('trim space', () => {
    const result = getNameFromEmails(['< foo@example.com >  '], true)
    expect(result).toBe('foo@example.com')
  })

  it('no address', () => {
    const result = getNameFromEmails(['FirstName <foo@example.com>'])
    expect(result).toBe('FirstName')
  })

  it('without name, always address', () => {
    const result = getNameFromEmails(['<foo@example.com>'], false)
    expect(result).toBe('foo@example.com')
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
      'data://image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wr+9OAAAAABJRU5ErkJggg==' // eslint-disable-line max-len
    )
    expect(result).toBe(
      'data://image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wr+9OAAAAABJRU5ErkJggg==' // eslint-disable-line max-len
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
