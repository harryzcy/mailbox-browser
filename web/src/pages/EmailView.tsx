import React, { useEffect } from 'react'
import { Await, useAsyncValue, useLoaderData, useNavigate } from 'react-router-dom'
import parse, {
  Element,
  Text,
  HTMLReactParserOptions,
  DOMNode,
  domToReact
} from 'html-react-parser'
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon
} from '@heroicons/react/20/solid'
import EmailMenuBar from '../components/emails/EmailMenuBar'
import { Email, trashEmail } from '../services/emails'
import { getNameFromEmails } from '../utils/emails'
import { formatDate } from '../utils/time'

interface EmailViewProps {}

export default function EmailView(props: EmailViewProps) {
  const data = useLoaderData() as { messageID: string, email: Email }

  const navigate = useNavigate()

  const goPrevious = () => {}
  const goNext = () => {}

  return (
    <>
      <div className="mb-4">
        <EmailMenuBar
          showOperations={true}
          handleDelete={async () => {
            await trashEmail(data.messageID)
            navigate(-1)
          }}
          hasPrevious={false}
          hasNext={false}
          goPrevious={goPrevious}
          goNext={goNext}
        />
      </div>

      <React.Suspense
        fallback={
          <div className="bg-neutral-50 rounded-md bg-neutral-50 dark:bg-neutral-800 p-3 overflow-scroll mb-4 dark:text-neutral-200">
            <span>Loading...</span>
          </div>
        }
      >
        <Await resolve={data.email}>
          {(email: Email) => (
            <>
              <div className="mb-2 px-3">
                <span className="text-xl font-normal dark:text-neutral-200">
                  {email.subject}
                </span>
              </div>
              <div className="bg-neutral-50 rounded-md bg-neutral-50 dark:bg-neutral-800 p-3 overflow-scroll mb-4">
                {/* header info for emails */}
                <div className="flex justify-between items-start">
                  <div className="dark:text-neutral-300">
                    <div>
                      <span>{getNameFromEmails(email.from)}</span>
                    </div>
                    <div className="text-sm">
                      <span>To: {getNameFromEmails(email.to)}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-300">
                    <span className="p-1">
                      {formatDate(email.timeReceived)}
                    </span>
                    <span className="inline-flex ml-4">
                      {/* TODO: implement reply and forward actions */}
                      <span className="inline-flex w-8 h-8 p-2 cursor-pointer rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:hover:text-neutral-200">
                        <ArrowUturnLeftIcon />
                      </span>
                      <span className="inline-flex w-8 h-8 p-2 cursor-pointer rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:hover:text-neutral-200">
                        <ArrowUturnRightIcon />
                      </span>
                    </span>
                  </div>
                </div>

                {/* email body */}
                <div className="mt-4">
                  <div className="email-sandbox dark:text-neutral-300">
                    {parseEmailContent(email)}
                  </div>
                </div>
              </div>
            </>
          )}
        </Await>
      </React.Suspense>
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
