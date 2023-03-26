import React, { useRef, useState } from 'react'
import { Await, useLoaderData, useNavigate } from 'react-router-dom'
import parse, {
  Element,
  Text,
  HTMLReactParserOptions,
  DOMNode,
  domToReact
} from 'html-react-parser'
import * as css from '@adobe/css-tools'
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import EmailMenuBar from '../components/emails/EmailMenuBar'
import { Email, trashEmail } from '../services/emails'
import { Thread } from '../services/threads'
import { getNameFromEmails } from '../utils/emails'
import { formatDate } from '../utils/time'
import { useOutsideClick } from '../hooks/useOutsideClick'
import { EmailDraft } from '../components/emails/EmailDraft'
import { DraftEmail } from '../contexts/DraftEmailContext'

export default function EmailView() {
  const data = useLoaderData() as
    | { type: 'email'; messageID: string; email: Email }
    | { type: 'thread'; threadID: string; thread: Thread }

  const navigate = useNavigate()

  const goPrevious = () => {}
  const goNext = () => {}

  const [showReply, setShowReply] = useState(false)

  const startReply = (email: Email) => {
    setShowReply(true)
  }

  const startForward = (email: Email) => {
    // TODO
  }

  return (
    <>
      <div className="mb-4">
        <EmailMenuBar
          showOperations={true}
          handleDelete={async () => {
            if ('threadID' in data) {
              // TODO
              throw new Error('Not yet supported')
            } else {
              await trashEmail(data.messageID)
            }
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
        {data.type == 'email' && (
          <Await resolve={data.email}>
            {(email: Email) => (
              <div className="overflow-scroll h-full pb-5">
                <div className="mb-2 px-3">
                  <span className="text-xl font-normal dark:text-neutral-200">
                    {email.subject}
                  </span>
                </div>
                <EmailBlock
                  email={email}
                  startReply={startReply}
                  startForward={startForward}
                />
                {showReply && (
                  <EmailDraft
                    email={
                      {
                        // TODO: use the correct sender based on domain
                        from: [email.to[0]],
                        subject: email.subject.startsWith('Re: ')
                          ? email.subject
                          : `Re: ${email.subject}`
                      } as DraftEmail
                    }
                    isReply
                    handleEmailChange={() => {}}
                  />
                )}
              </div>
            )}
          </Await>
        )}

        {data.type == 'thread' && (
          <Await resolve={data.thread}>
            {(thread: Thread) => (
              <div className="overflow-scroll h-full pb-5">
                <div className="mb-2 px-3">
                  <span className="text-xl font-normal dark:text-neutral-200">
                    {thread.subject}
                  </span>
                </div>
                {thread.emails?.map((email) => (
                  <EmailBlock
                    key={email.messageID}
                    email={email}
                    startReply={startReply}
                    startForward={startForward}
                  />
                ))}
              </div>
            )}
          </Await>
        )}
      </React.Suspense>
    </>
  )
}

type EmailBlockProps = {
  email: Email
  startReply: (email: Email) => void
  startForward: (email: Email) => void
}

function EmailBlock(props: EmailBlockProps) {
  const { email, startForward, startReply } = props

  const [showMoreActions, setShowMoreActions] = React.useState(false)
  const showMoreActionsRef = useRef(null)

  useOutsideClick(showMoreActionsRef, () => setShowMoreActions(false))

  return (
    <>
      <div className="bg-neutral-50 rounded-md bg-neutral-50 dark:bg-neutral-800 p-3 mb-4">
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
            <span className="p-1">{formatDate(email.timeReceived)}</span>
            <span className="inline-flex ml-4 relative">
              <span
                className="inline-flex w-8 h-8 p-2 cursor-pointer rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
                onClick={() => {
                  startReply(email)
                }}
              >
                <ArrowUturnLeftIcon />
              </span>
              <span
                className="inline-flex w-8 h-8 p-2 cursor-pointer rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
                onClick={() => {
                  startForward(email)
                }}
              >
                <ArrowUturnRightIcon />
              </span>
              <span
                className="inline-flex w-8 h-8 p-2 cursor-pointer rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
                onClick={() => setShowMoreActions(!showMoreActions)}
              >
                <EllipsisVerticalIcon />
              </span>

              {showMoreActions && (
                <span
                  ref={showMoreActionsRef}
                  className="absolute right-0 top-8 w-28 rounded-md py-1 border select-none bg-white dark:border-neutral-600 dark:bg-neutral-800"
                >
                  <div
                    className="px-2 py-1 w-full cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600"
                    onClick={() => {
                      setShowMoreActions(false)
                      window.open(`/raw/${email.messageID}`, '_blank')
                    }}
                  >
                    View original
                  </div>
                </span>
              )}
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
      if (['meta', 'link', 'script'].includes(domNode.name)) return <></>
      if (domNode.name === 'style') {
        domNode.children = domNode.children
          .map((child) => {
            // nodeType 3 is text in domhandler package
            if (child.nodeType !== 3) return null
            return new Text(transformCss(child.data))
          })
          .filter((child) => child !== null) as Text[]
      }
      if (domNode.name === 'img') {
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
  if (element.props.children.length > 0) {
    return element
  }
  // fallback to text if html parsing fails
  console.log(email.text)
  return (
    <pre className="w-full block whitespace-pre-wrap break-words font-sans">
      {email.text}
    </pre>
  )
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
        return `.email-sandbox ${selector}`
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
