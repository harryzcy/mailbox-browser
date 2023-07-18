import React, { useContext, useEffect, useRef, useState } from 'react'
import { Await, useLoaderData, useNavigate } from 'react-router-dom'
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  EllipsisVerticalIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import EmailMenuBar from '../components/emails/EmailMenuBar'
import {
  Email,
  generateLocalDraftID,
  readEmail,
  saveEmail,
  trashEmail,
  unreadEmail
} from '../services/emails'
import { Thread } from '../services/threads'
import { getNameFromEmails } from '../utils/emails'
import { formatDate } from '../utils/time'
import { useOutsideClick } from '../hooks/useOutsideClick'
import { EmailDraft } from '../components/emails/EmailDraft'
import { DraftEmail, DraftEmailsContext } from '../contexts/DraftEmailContext'
import { parseEmailContent } from '../utils/emails'
import { ConfigContext } from '../contexts/ConfigContext'
import { useInboxContext } from './EmailRoot'

export default function EmailView() {
  const data = useLoaderData() as
    | { type: 'email'; messageID: string; email: Email }
    | { type: 'thread'; threadID: string; thread: Thread }

  const navigate = useNavigate()

  const goPrevious = () => {}
  const goNext = () => {}

  const { activeEmail: activeReplyEmail, dispatch: dispatchDraftEmail } =
    useContext(DraftEmailsContext)
  const [isInitialReplyOpen, setIsInitialReplyOpen] = useState(false)

  const configContext = useContext(ConfigContext)

  const startReply = (email: Email) => {
    setIsInitialReplyOpen(true)
    const draftID = generateLocalDraftID()
    dispatchDraftEmail({
      type: 'new-reply',
      messageID: draftID,
      replyEmail: email,
      allowedAddresses: configContext.state.config.emailAddresses
    })

    // TODO
  }

  const openReply = (email: Email) => {
    dispatchDraftEmail({
      type: 'load',
      email: email
    })
  }

  const draftElemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!draftElemRef.current) return
    draftElemRef.current.scrollIntoView()
  }, [isInitialReplyOpen])

  const startForward = (email: Email) => {
    dispatchDraftEmail({
      type: 'new-forward',
      messageID: generateLocalDraftID(),
      forwardEmail: email
    })
    // TODO
  }

  const handleEmailChange = (email: DraftEmail) => {
    dispatchDraftEmail({
      type: 'update',
      messageID: email.messageID,
      email
    })
  }

  const handleSend = async () => {
    const email = activeReplyEmail
    if (!email) return
    await saveEmail({
      messageID: email.messageID,
      subject: email.subject,
      from: email.from,
      to: email.to,
      cc: email.cc,
      bcc: email.bcc,
      replyTo: email.from,
      html: email.html,
      text: email.text,
      send: true // save and send
    })

    dispatchDraftEmail({
      type: 'remove',
      messageID: email.messageID
    })
  }

  const handleDelete = async () => {
    if ('threadID' in data) {
      // TODO
      throw new Error('Not yet supported')
    } else {
      await trashEmail(data.messageID)
    }
    navigate(-1)
  }

  const handleRead = async () => {
    if ('threadID' in data) {
      // TODO
      throw new Error('Not yet supported')
    } else {
      await readEmail(data.messageID)
    }
  }

  const handleUnread = async () => {
    if ('threadID' in data) {
      // TODO
      throw new Error('Not yet supported')
    } else {
      await unreadEmail(data.messageID)
    }
  }

  return (
    <>
      <div className="mb-4">
        <EmailMenuBar
          emailIDs={'messageID' in data ? [data.messageID] : []}
          showOperations={true}
          handleDelete={() => {
            void handleDelete()
          }}
          handleRead={() => {
            void handleRead()
          }}
          handleUnread={() => {
            void handleUnread()
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
                {activeReplyEmail &&
                  activeReplyEmail.replyEmail?.messageID ===
                    email.messageID && (
                    <div ref={draftElemRef}>
                      <EmailDraft
                        email={activeReplyEmail}
                        isReply
                        handleEmailChange={handleEmailChange}
                        handleSend={() => {
                          void handleSend()
                        }}
                      />
                    </div>
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
                {activeReplyEmail && (
                  <EmailDraft
                    email={activeReplyEmail}
                    isReply
                    handleEmailChange={handleEmailChange}
                    handleSend={() => {
                      void handleSend()
                    }}
                  />
                )}
                {thread.draftID && !activeReplyEmail && (
                  <div className="bg-neutral-50 rounded-md bg-neutral-50 dark:bg-neutral-800 p-3 mb-4">
                    <div className="flex justify-between items-start">
                      <span className="text-red-300">[Draft]</span>
                      <span className="text-neutral-500 dark:text-neutral-300">
                        <span
                          className="inline-flex w-8 h-8 p-2 cursor-pointer rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
                          onClick={() => {
                            openReply(thread.draft!)
                          }}
                        >
                          <PencilIcon />
                        </span>
                      </span>
                    </div>
                  </div>
                )}
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

  const configContext = useContext(ConfigContext)

  const { markAsRead } = useInboxContext()

  useEffect(() => {
    if (email.unread) {
      markAsRead(email.messageID)
    }
  }, []) // only run once

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
            {parseEmailContent(email, configContext.state.config.disableProxy)}
          </div>
        </div>
      </div>
    </>
  )
}
