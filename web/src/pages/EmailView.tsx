import React from 'react'
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
  ArrowUturnRightIcon
} from '@heroicons/react/20/solid'
import EmailMenuBar from '../components/emails/EmailMenuBar'
import { Email, trashEmail } from '../services/emails'
import { getNameFromEmails } from '../utils/emails'
import { formatDate } from '../utils/time'

interface EmailViewProps {}

export default function EmailView(props: EmailViewProps) {
  const data = useLoaderData() as { messageID: string; email: Email }

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
  return element
}

// transformCss transforms css to be scoped to the email-sandbox class
function transformCss(code: string) {
  const obj = css.parse(code, { silent: true })

  obj.stylesheet.rules = transformCssRules(obj.stylesheet.rules)
  const result = css.stringify(obj, { compress: false })

  return result
}

function transformCssRules(rules: Array<css.CssAtRuleAST>) {
  return rules.map((rule) => {
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
