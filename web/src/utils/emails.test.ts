import { exportedForTesting } from './emails'
const { makeCSSURL } = exportedForTesting

describe('makeCSSURL', () => {
  it('should return a string', () => {
    const result = makeCSSURL('test')
    expect(typeof result).toBe('string')
  })

  it('arbitrary value without url function', () => {
    const result = makeCSSURL('test')
    expect(result).toBe('test')
  })

  it('url function with no quotes', () => {
    const result = makeCSSURL('url(https://example.com/image.png)')
    expect(result).toBe('url(/proxy?l=https%3A%2F%2Fexample.com%2Fimage.png)')
  })

  it('url function with single quotes', () => {
    const result = makeCSSURL("url('https://example.com/image.png')")
    expect(result).toBe('url(/proxy?l=https%3A%2F%2Fexample.com%2Fimage.png)')
  })

  it('url function with double quotes', () => {
    const result = makeCSSURL('url("https://example.com/image.png")')
    expect(result).toBe('url(/proxy?l=https%3A%2F%2Fexample.com%2Fimage.png)')
  })

  it('url function with spaces', () => {
    const result = makeCSSURL('url( https://example.com/image.png )')
    expect(result).toBe('url(/proxy?l=https%3A%2F%2Fexample.com%2Fimage.png)')
  })

  it('multiple url functions', () => {
    const result = makeCSSURL(
      'url(https://example.com/image.png) url(https://example.com/image2.png)'
    )
    expect(result).toBe(
      'url(/proxy?l=https%3A%2F%2Fexample.com%2Fimage.png) url(/proxy?l=https%3A%2F%2Fexample.com%2Fimage2.png)'
    )
  })

  it('url function with data uri', () => {
    const result = makeCSSURL(
      'data://image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wr+9OAAAAABJRU5ErkJggg==' // eslint-disable-line max-len
    )
    expect(result).toBe(
      'data://image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wr+9OAAAAABJRU5ErkJggg==' // eslint-disable-line max-len
    )
  })
})
