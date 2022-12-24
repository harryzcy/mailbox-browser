import { useLoaderData } from 'react-router-dom'
import parse, {
  Element,
  HTMLReactParserOptions,
  DOMNode,
  domToReact
} from 'html-react-parser'
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
        <span className="text-xl font-normal">{email.subject}</span>
      </div>

      <div className="bg-gray-50 rounded md:rounded-md border p-3">
        {/* header info for emails */}
        <div className="flex justify-between items-start">
          <div>
            <div>
              <span>{getNameFromEmails(email.from)}</span>
            </div>
            <div className="text-sm">
              <span>To: {getNameFromEmails(email.to)}</span>
            </div>
          </div>

          <div className="text-sm text-gray-500 items-center flex">
            <span className="p-1">{formatDate(email.timeReceived)}</span>
            <span className="inline-flex ml-4">
              {/* TODO: implement reply and forward actions */}
              <span className="inline-flex w-8 h-8 p-2 cursor-pointer rounded-full hover:bg-gray-200">
                <ArrowUturnLeftIcon />
              </span>
              <span className="inline-flex w-8 h-8 p-2 cursor-pointer rounded-full hover:bg-gray-200">
                <ArrowUturnRightIcon />
              </span>
            </span>
          </div>
        </div>

        {/* email body */}
        <div className="mt-4">{parseEmailContent(email)}</div>
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
      if (domNode.name === 'html') {
        return <>{domToReact(domNode.children, options)}</>
      }
      if (domNode.name === 'head') {
        return <></>
      }
      if (domNode.name === 'body') {
        return <>{domToReact(domNode.children, options)}</>
      }
    }
  }
  const element = parse(email.html, options)
  return element
}
