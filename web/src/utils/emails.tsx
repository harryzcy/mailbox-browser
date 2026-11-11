import { isTag, isText } from 'domhandler'
import parse, {
  DOMNode,
  Element,
  HTMLReactParserOptions,
  Text,
  domToReact
} from 'html-react-parser'
import { type AtRule, type Root, type Rule, parse as parseCss } from 'postcss'

import { type Email, type File } from 'services/emails'

import {
  allowedTags,
  globalAttributes,
  imgAttributes,
  silenceTags
} from 'utils/elements'

export function parseEmailName(emails: string[] | null): {
  name: string | null
  address: string | null
} {
  if (!emails || emails.length === 0) {
    return { name: null, address: null }
  }

  const regex = /(.*?)<(.*?)>/gu
  const match = regex.exec(emails[0])
  if (!match) return { name: null, address: emails[0] }
  const name = match[1].trim()
  const address = match[2].trim()
  return {
    name: name === '' ? null : name,
    address: address === '' ? null : address
  }
}

export function parseEmailContent(
  email: Email,
  disableProxy?: boolean,
  loadImage?: boolean
) {
  if (!email.html) return email.text

  const host = `${window.location.protocol}//${window.location.host}`

  const options: HTMLReactParserOptions = {
    replace: (domNode: DOMNode) => {
      // DOMNode = Comment | Element | ProcessingInstruction | Text;
      if (isText(domNode)) {
        return domNode.data
      }
      if (!isTag(domNode)) {
        return
      }
      if (['html', 'head', 'body'].includes(domNode.name)) {
        return <>{domToReact(domNode.children as DOMNode[], options)}</>
      }
      if (!allowedTags.includes(domNode.name)) {
        if (!silenceTags.includes(domNode.name)) {
          console.warn(`Unsupported tag: ${domNode.name}`)
        }
        // html-react-parser only substitutes a replacement that passes
        // isValidElement, so this must stay an element. Returning null would
        // fall through and render the disallowed tag.
        // oxlint-disable-next-line jsx-no-useless-fragment
        return <></>
      }
      if (domNode.name === 'a') {
        domNode.attribs.target = '_blank'
        domNode.attribs.rel = 'noopener noreferrer'
        return
      }

      // handle inline styles
      if (domNode.attribs.style) {
        domNode.attribs.style = transformStyles(host, domNode.attribs.style)
      }

      if (domNode.name === 'style') {
        domNode.children = domNode.children
          .map((child) => {
            // nodeType 3 is text in domhandler package
            if (child.nodeType !== 3) return null
            return new Text(transformCss(host, child.data))
          })
          .filter((child) => child !== null)
      }
      if (domNode.name === 'img' && domNode.attribs.src) {
        if (domNode.attribs.src.startsWith('cid:')) {
          const cid = domNode.attribs.src.replace('cid:', '')
          let disposition = ''
          if (containContentID(email.attachments, cid)) {
            disposition = 'attachments'
          } else if (containContentID(email.inlines, cid)) {
            disposition = 'inlines'
          } else if (containContentID(email.otherParts, cid)) {
            disposition = 'others'
          }

          if (disposition !== '') {
            domNode.attribs.src = `${window.location.origin}/web/emails/${email.messageID}/${disposition}/${cid}`
          }
        } else {
          if (!loadImage) {
            domNode.attribs.src = ''
          } else if (!disableProxy) {
            domNode.attribs['data-original-src'] = domNode.attribs.src
            domNode.attribs.src = makeProxyURL(host, domNode.attribs.src)
          }
        }

        domNode.attribs = filterElementAttributes(domNode.name, domNode.attribs)
      }
    }
  }
  const element = parse(email.html, options)
  if (Array.isArray(element)) {
    // Wraps the array so every branch returns a single renderable node.
    // oxlint-disable-next-line jsx-no-useless-fragment
    return <>{element}</>
  } else if (typeof element === 'string') {
    return element
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (element.props.children) {
    return element
  }
  // fallback to text if html parsing fails
  return (
    <pre className="block w-full font-sans wrap-break-word whitespace-pre-wrap">
      {email.text}
    </pre>
  )
}

function filterElementAttributes(
  domName: Element['name'],
  attribs: Element['attribs']
): Element['attribs'] {
  if (attribs === undefined) return attribs
  if (domName === 'img') {
    return Object.fromEntries(
      Object.entries(attribs).filter(([key]) => {
        if (globalAttributes.includes(key)) return true
        if (imgAttributes.includes(key)) return true
        return key.startsWith('data-')
      })
    )
  }
  return attribs
}

// containContentID returns true if there is a file with the given contentID
function containContentID(files: File[] | undefined, cid: string) {
  if (files === undefined) return false
  return files.some((file) => file.contentID === cid)
}

export function parseEmailHTML(html: string) {
  const email = { html } as Email
  return parseEmailContent(email)
}

function transformStyles(host: string, styles: string) {
  styles = styles.trim()
  let styleParts = styles.split(';')
  styleParts = styleParts.map((part) => {
    if (part.length === 0) return part

    const split = part.split(':')
    const property = split[0].trim()
    const value = split.slice(1).join(':')
    if (!property || !value) return part

    if (isURLProperty(property)) {
      const transformedValue = makeCSSURL(host, value)
      return `${property}:${transformedValue}`
    }

    return part
  })

  return styleParts.join(';')
}

// transformCss scopes an email's CSS to the email-sandbox class and proxies
// remote URLs. A style block that fails to parse is dropped rather than
// failing the whole email.
function transformCss(host: string, code: string) {
  let root: Root
  try {
    root = parseCss(stripCommentMarkers(code))
  } catch {
    return ''
  }

  root.walkRules((rule) => {
    if (!isDocumentRule(rule)) return
    rule.selectors = rule.selectors.map((selector) =>
      selector.includes('.email-sandbox')
        ? selector
        : `.email-sandbox ${selector}`
    )
  })
  root.walkDecls((declaration) => {
    if (isURLProperty(declaration.prop)) {
      declaration.value = makeCSSURL(host, declaration.value)
    }
  })

  return root.toString()
}

// stripCommentMarkers removes the HTML comment markers emails often wrap their
// styles in. Browsers ignore them at the edges of a stylesheet, but PostCSS
// rejects them.
function stripCommentMarkers(code: string) {
  let css = code.trim()
  if (css.startsWith('<!--')) css = css.slice('<!--'.length)
  if (css.endsWith('-->')) css = css.slice(0, -'-->'.length)
  return css
}

// isDocumentRule returns true if the rule's selectors match document
// elements, as opposed to keyframe selectors or rules nested in another rule.
function isDocumentRule(rule: Rule) {
  let parent = rule.parent
  while (parent && parent.type !== 'root') {
    if (parent.type === 'rule') return false
    if (
      parent.type === 'atrule' &&
      /keyframes$/iu.test((parent as AtRule).name)
    ) {
      return false
    }
    parent = parent.parent
  }
  return true
}

function makeProxyURL(host: string, url: string) {
  if (!url) return url
  if (url.startsWith('data:')) return url
  url = url.trim()
  return `${host}/proxy?l=${encodeURIComponent(url)}`
}

// isURLProperty returns true if the CSS property may have url function
function isURLProperty(property: string) {
  const watchProperties = [
    'background',
    'background-image',
    'border',
    'border-image',
    'border-image-source',
    'content',
    'cursor',
    'filter',
    'list-style',
    'list-style-image',
    'mask',
    'mask-image',
    'offset-path',
    'src'
  ]

  return watchProperties.includes(property.toLowerCase())
}

function makeCSSURL(host: string, value: string) {
  return value.replaceAll(
    /url\( *['"]?(.*?)['"]? *\)/gu,
    (match, url: string) => {
      if (url.startsWith('https://') || url.startsWith('http://')) {
        return `url(${makeProxyURL(host, url)})`
      }
      return match
    }
  )
}

export const exportedForTesting = {
  makeCSSURL,
  transformCss
}
