import { isTag, isText } from 'domhandler'
import parse, {
  DOMNode,
  Element,
  HTMLReactParserOptions,
  Text,
  domToReact
} from 'html-react-parser'

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
  // Remote CSS resources follow the same rules as images.
  const remoteCSS: RemoteCSS = !loadImage
    ? 'block'
    : disableProxy
      ? 'direct'
      : 'proxy'

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
        domNode.attribs.style = makeCSSURL(
          host,
          domNode.attribs.style,
          remoteCSS
        )
      }

      if (domNode.name === 'style') {
        domNode.children = domNode.children
          .map((child) => {
            // nodeType 3 is text in domhandler package
            if (child.nodeType !== 3) return null
            return new Text(makeCSSURL(host, child.data, remoteCSS))
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
    // Inline styles, since app classes don't apply in the sandbox.
    <pre
      style={{
        fontFamily: 'inherit',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap'
      }}
    >
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

// EmailContent parses while rendering, so error boundaries catch failures.
export function EmailContent(props: {
  email: Email
  disableProxy?: boolean
  loadImage?: boolean
}) {
  return parseEmailContent(props.email, props.disableProxy, props.loadImage)
}

function makeProxyURL(host: string, url: string) {
  if (!url) return url
  if (url.startsWith('data:')) return url
  url = url.trim()
  return `${host}/proxy?l=${encodeURIComponent(url)}`
}

type RemoteCSS = 'proxy' | 'direct' | 'block'

// makeCSSURL rewrites remote url() and @import resources in CSS.
function makeCSSURL(host: string, value: string, remote: RemoteCSS = 'proxy') {
  return value.replaceAll(
    /url\(\s*(['"]?)(.*?)\1\s*\)|(@import\s*)(['"])(.*?)\4/giu,
    (
      match,
      _quote: string,
      url: string | undefined,
      importRule: string | undefined,
      _importQuote: string,
      importURL: string | undefined
    ) => {
      const resource = url ?? importURL ?? ''
      if (remote === 'direct' || !/^\s*https?:\/\//iu.test(resource)) {
        return match
      }
      const replacement =
        remote === 'block' ? 'none' : `url(${makeProxyURL(host, resource)})`
      return `${importRule ?? ''}${replacement}`
    }
  )
}

export const exportedForTesting = {
  makeCSSURL
}
