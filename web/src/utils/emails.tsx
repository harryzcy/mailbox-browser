import * as css from '@adobe/css-tools'
import parse, {
  DOMNode,
  Element,
  HTMLReactParserOptions,
  Text,
  domToReact
} from 'html-react-parser'

import { type Email, type File } from 'services/emails'

import { allowedTags, globalAttributes, imgAttributes } from 'utils/elements'

export function getNameFromEmails(emails: string[] | null): string {
  if (!emails || emails.length === 0) {
    return ''
  }
  const regex = /(.*?) ?<.*?>/g
  const match = regex.exec(emails[0])
  if (match) {
    return match[1]
  }
  return emails[0]
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
      if (!(domNode instanceof Element)) return
      if (['html', 'head', 'body'].includes(domNode.name)) {
        return <>{domToReact(domNode.children as DOMNode[], options)}</>
      }
      if (domNode.name === 'head') return <></>
      if (!allowedTags.includes(domNode.name)) return <></>
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
          .filter((child) => child !== null) as Text[]
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
    <pre className="block w-full whitespace-pre-wrap break-words font-sans">
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

// transformCss transforms css to be scoped to the email-sandbox class
function transformCss(host: string, code: string) {
  const obj = css.parse(code, { silent: true })

  const cssRules = transformCssRules(host, obj.stylesheet.rules)
  if (cssRules) obj.stylesheet.rules = cssRules
  const result = css.stringify(obj, { compress: false })

  return result
}

function transformCssRules(host: string, rules?: Array<css.CssAtRuleAST>) {
  const replaceDeclarations = (
    declarations: Array<css.CssCommentAST | css.CssDeclarationAST>
  ) => {
    return declarations.map((declaration) => {
      if (declaration.type === css.CssTypes.declaration) {
        if (isURLProperty(declaration.property)) {
          declaration.value = makeCSSURL(host, declaration.value)
        }
      }
      return declaration
    })
  }

  return rules?.map((rule) => {
    if (rule.type === css.CssTypes.rule) {
      rule.selectors = rule.selectors?.map((selector) => {
        if (selector.startsWith('@')) {
          return selector
        }
        return selector.includes('.email-sandbox')
          ? selector
          : `.email-sandbox ${selector}`
      })
      rule.declarations = replaceDeclarations(rule.declarations)
    } else if (rule.type === css.CssTypes.fontFace) {
      rule.declarations = replaceDeclarations(rule.declarations)
    } else if ('rules' in rule) {
      rule.rules = transformCssRules(host, rule.rules)
    }
    return rule
  })
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
  return value.replace(/url\( *['"]?(.*?)['"]? *\)/g, (match, url: string) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      return `url(${makeProxyURL(host, url)})`
    }
    return match
  })
}

export const exportedForTesting = {
  makeCSSURL
}
