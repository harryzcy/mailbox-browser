import * as css from '@adobe/css-tools'
import parse, {
  DOMNode,
  Element,
  HTMLReactParserOptions,
  Text,
  domToReact
} from 'html-react-parser'

import { Email } from '../services/emails'

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

export function parseEmailContent(email: Email, disableProxy?: boolean) {
  if (!email.html) return email.text

  const options: HTMLReactParserOptions = {
    replace: (domNode: DOMNode) => {
      if (!(domNode instanceof Element)) return
      if (['html', 'head', 'body'].includes(domNode.name)) {
        return <>{domToReact(domNode.children as DOMNode[], options)}</>
      }
      if (['meta', 'link', 'script'].includes(domNode.name)) return <></>
      if (domNode.name === 'a') {
        domNode.attribs.target = '_blank'
        domNode.attribs.rel = 'noopener noreferrer'
        return
      }

      // handle inline styles
      if (domNode.attribs.style) {
        domNode.attribs.style = transformStyles(domNode.attribs.style)
      }

      if (domNode.name === 'style') {
        domNode.children = domNode.children
          .map((child) => {
            // nodeType 3 is text in domhandler package
            if (child.nodeType !== 3) return null
            return new Text(transformCss(child.data))
          })
          .filter((child) => child !== null) as Text[]
      }
      if (domNode.name === 'img' && domNode.attribs.src) {
        if (domNode.attribs.src.startsWith('cid:')) {
          const cid = domNode.attribs.src.replace('cid:', '')
          const isInline = email.inlines.some(
            (inline) => inline.contentID === cid
          )
          if (isInline) {
            domNode.attribs.src = `${window.location.origin}/web/emails/${email.messageID}/inlines/${cid}`
          }

          const isAttachment = email.attachments.some(
            (inline) => inline.contentID === cid
          )
          if (isAttachment) {
            domNode.attribs.src = `${window.location.origin}/web/emails/${email.messageID}/attachments/${cid}`
          }
        } else {
          if (!disableProxy) {
            domNode.attribs.src = makeProxyURL(domNode.attribs.src)
          }
        }
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

export function parseEmailHTML(html: string) {
  const email = { html } as Email
  return parseEmailContent(email)
}

function transformStyles(styles: string) {
  styles = styles.trim()
  let styleParts = styles.split(';')
  styleParts = styleParts.map((part) => {
    if (part.length === 0) return part

    const split = part.split(':')
    const property = split[0].trim()
    const value = split.slice(1).join(':')
    if (!property || !value) return part

    if (isURLProperty(property)) {
      const transformedValue = makeCSSURL(value)
      return `${property}:${transformedValue}`
    }

    return part
  })

  return styleParts.join(';')
}

// transformCss transforms css to be scoped to the email-sandbox class
function transformCss(code: string) {
  const obj = css.parse(code, { silent: true })

  const cssRules = transformCssRules(obj.stylesheet.rules)
  if (cssRules) obj.stylesheet.rules = cssRules
  const result = css.stringify(obj, { compress: false })

  return result
}

function transformCssRules(rules?: Array<css.CssAtRuleAST>) {
  return rules?.map((rule) => {
    if (isCssRule(rule)) {
      rule.selectors = rule.selectors?.map((selector) => {
        if (selector.startsWith('@')) return selector
        return selector.includes('.email-sandbox')
          ? selector
          : `.email-sandbox ${selector}`
      })
      rule.declarations = rule.declarations.map((declaration) => {
        if (declaration.type === css.CssTypes.declaration) {
          if (isURLProperty(declaration.property)) {
            declaration.value = makeCSSURL(declaration.value)
          }
        }
        return declaration
      })
    } else if ('rules' in rule) {
      rule.rules = transformCssRules(rule.rules)
    }
    return rule
  })
}

function isCssRule(rule: css.CssAtRuleAST): rule is css.CssRuleAST {
  return rule.type === css.CssTypes.rule
}

function makeProxyURL(url: string) {
  if (!url) return url
  if (url.startsWith('data:')) return url
  return `/proxy?l=${encodeURIComponent(url)}`
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

function makeCSSURL(value: string) {
  return value.replace(/url\( *['"]?(.*?)['"]? *\)/g, (match, url: string) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      return `url(${makeProxyURL(url)})`
    }
    return match
  })
}

export const exportedForTesting = {
  makeCSSURL
}
