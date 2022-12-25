import { useLoaderData } from 'react-router-dom'
import parse, {
  Element,
  HTMLReactParserOptions,
  DOMNode,
  domToReact
} from 'html-react-parser'
import { Text } from 'domhandler'
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon
} from '@heroicons/react/20/solid'
import EmailMenuBar from '../components/emails/EmailMenuBar'
import { Email } from '../services/emails'
import { getNameFromEmails } from '../utils/emails'
import { formatDate } from '../utils/time'

interface EmailViewProps {}

export default function EmailView(props: EmailViewProps) {
  const email = useLoaderData() as Email

  const goPrevious = () => {}
  const goNext = () => {}

  return (
    <>
      <div className="mb-4">
        <EmailMenuBar
          hasPrevious={false}
          hasNext={false}
          goPrevious={goPrevious}
          goNext={goNext}
        />
      </div>

      <div className="mb-2 px-3">
        <span className="text-xl font-normal dark:text-gray-200">
          {email.subject}
        </span>
      </div>

      <div className="bg-gray-50 rounded md:rounded-md bg-gray-50 dark:bg-gray-800 p-3">
        {/* header info for emails */}
        <div className="flex justify-between items-start">
          <div className="dark:text-gray-300">
            <div>
              <span>{getNameFromEmails(email.from)}</span>
            </div>
            <div className="text-sm">
              <span>To: {getNameFromEmails(email.to)}</span>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
            <span className="p-1">{formatDate(email.timeReceived)}</span>
            <span className="inline-flex ml-4">
              {/* TODO: implement reply and forward actions */}
              <span className="inline-flex w-8 h-8 p-2 cursor-pointer rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-200">
                <ArrowUturnLeftIcon />
              </span>
              <span className="inline-flex w-8 h-8 p-2 cursor-pointer rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-200">
                <ArrowUturnRightIcon />
              </span>
            </span>
          </div>
        </div>

        {/* email body */}
        <div className="mt-4">
          <div className="email-sandbox dark:text-gray-300">
            {parseEmailContent(email)}
          </div>
        </div>
      </div>
    </>
  )
}

function parseEmailContent(email: Email) {
  if (!email.html) return email.text

  const options: HTMLReactParserOptions = {
    replace: (domNode: DOMNode) => {
      if (!(domNode instanceof Element)) return
      if (domNode.name === 'a') {
        domNode.attribs.target = '_blank'
        domNode.attribs.rel = 'noopener noreferrer'
        return domNode
      }
      if (['html', 'head', 'body'].includes(domNode.name)) {
        return <>{domToReact(domNode.children, options)}</>
      }
      if (['meta', 'link'].includes(domNode.name)) return <></>
      if (domNode.name === 'style') {
        if (domNode.children[0].nodeType !== 3) return
        domNode.children = domNode.children
          .map((child) => {
            // nodeType 3 is text in domhandler package
            if (child.nodeType !== 3) return null
            return new Text(transformCss(child.data))
          })
          .filter((child) => child !== null) as Text[]
      }
    }
  }
  const element = parse(email.html, options)
  return element
}

function transformCss(css: string) {
  const rules = css.replace(/[\n\r\t\s]+/g, ' ').matchAll(/(.*?)({.*?})/g)

  return Array.from(rules)
    .map((rule) => {
      const [_, selector, properties] = rule
      return `.email-sandbox ${selector.trim()}${properties}`
    })
    .join(' ')
}
