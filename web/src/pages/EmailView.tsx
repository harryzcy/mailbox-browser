import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  EllipsisVerticalIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Await, useLoaderData, useNavigate } from 'react-router-dom'

import { toast } from '@ui/use-toast'

import { EmailDraft } from 'components/emails/EmailDraft'
import EmailMenuBar from 'components/emails/EmailMenuBar'

import { ConfigContext } from 'contexts/ConfigContext'
import { DraftEmail, DraftEmailsContext } from 'contexts/DraftEmailContext'

import { useOutsideClick } from 'hooks/useOutsideClick'

import { useInboxContext } from 'pages/EmailRoot'

import {
  CreateEmailProps,
  Email,
  createEmail,
  generateLocalDraftID,
  readEmail,
  saveEmail,
  trashEmail,
  unreadEmail
} from 'services/emails'
import { Thread } from 'services/threads'

import { getNameFromEmails } from 'utils/emails'
import { parseEmailContent } from 'utils/emails'
import { formatDate } from 'utils/time'

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

  const startDraft = async (draftID: string, replyEmail?: Email) => {
    const body = {
      subject: '',
      from: [],
      to: [],
      cc: [],
      bcc: [],
      replyTo: [],
      html: '',
      text: '',
      send: false
    } as CreateEmailProps
    if (replyEmail) {
      body.replyEmailID = replyEmail.messageID
    }

    const email = await createEmail(body)

    dispatchDraftEmail({
      type: 'update',
      messageID: draftID,
      email
    })
  }

  const startReply = async (email: Email) => {
    setIsInitialReplyOpen(true)
    const draftID = generateLocalDraftID()
    dispatchDraftEmail({
      type: 'new-reply',
      messageID: draftID,
      replyEmail: email,
      allowedAddresses: configContext.state.config.emailAddresses
    })

    await startDraft(draftID)
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

  const startForward = async (email: Email) => {
    const draftID = generateLocalDraftID()
    dispatchDraftEmail({
      type: 'new-forward',
      messageID: draftID,
      forwardEmail: email
    })

    await startDraft(draftID)
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
      try {
        await readEmail(data.messageID)
      } catch (e) {
        toast({
          title: 'Failed to mark email as read'
        })
      }
    }
  }

  const handleUnread = async () => {
    if ('threadID' in data) {
      // TODO
      throw new Error('Not yet supported')
    } else {
      try {
        await unreadEmail(data.messageID)
      } catch (e) {
        toast({
          title: 'Failed to mark email as unread'
        })
      }
    }
  }

  return (
    <>
      <div className="px-2 md:px-0 mb-4 preflight">
        <EmailMenuBar
          emailIDs={'messageID' in data ? [data.messageID] : []}
          handleBack={() => {
            navigate(-1)
          }}
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
          <div className="px-2 md:px-0 mb-4 overflow-scroll rounded-md bg-neutral-50 p-3 dark:bg-neutral-800 dark:text-neutral-200">
            <span className="px-2">Loading...</span>
          </div>
        }
      >
        {data.type == 'email' && (
          <Await resolve={data.email}>
            {(email: Email) => (
              <div className="h-full overflow-y-scroll pb-5 px-2 md:px-0">
                <div className="mb-2 px-3">
                  <span className="text-xl font-normal dark:text-neutral-200">
                    {email.subject}
                  </span>
                </div>
                <EmailBlock
                  email={email}
                  startReply={(email) => void startReply(email)}
                  startForward={(email) => void startForward(email)}
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
              <div className="h-full overflow-scroll pb-5">
                <div className="mb-2 px-3">
                  <span className="text-xl font-normal dark:text-neutral-200">
                    {thread.subject}
                  </span>
                </div>
                {thread.emails?.map((email) => (
                  <EmailBlock
                    key={email.messageID}
                    email={email}
                    startReply={(email) => void startReply(email)}
                    startForward={(email) => void startForward(email)}
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
                  <div className="preflight mb-4 rounded-md bg-neutral-50 p-3 dark:bg-neutral-800 w-full">
                    <div className="flex items-start justify-between">
                      <span className="text-red-300">[Draft]</span>
                      <span className="text-neutral-500 dark:text-neutral-300">
                        <span
                          className="inline-flex h-8 w-8 cursor-pointer rounded-full p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
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
  const showMoreActionsRef = useRef<HTMLSpanElement>(null)
  useOutsideClick(showMoreActionsRef, () => setShowMoreActions(false))

  const configContext = useContext(ConfigContext)
  const [showImages, setShowImages] = useState(
    configContext.state.config.imagesAutoLoad
  )

  const { markAsRead } = useInboxContext()
  useEffect(() => {
    if (email.unread) {
      markAsRead(email.messageID)
    }
  }, []) // only run once

  return (
    <>
      <div className="mb-4 rounded-md bg-neutral-50 p-3 dark:bg-neutral-800">
        {!showImages && (
          <div className="preflight flex gap-2 border rounded-t-md -mx-3 -mt-3 px-3 py-1 mb-3 bg-gray-200 dark:bg-gray-700">
            <span>Images are not displayed</span>
            <span
              className="text-blue-600 dark:text-blue-200 cursor-pointer"
              onClick={() => {
                setShowImages(true)
              }}
            >
              Display images below
            </span>
          </div>
        )}

        {/* header info for emails */}
        <div className="preflight flex items-start justify-between">
          <div className="dark:text-neutral-300">
            <div>
              <span>{getNameFromEmails(email.from, true)}</span>
            </div>
            <div className="text-sm">
              <span>To: {getNameFromEmails(email.to, true)}</span>
            </div>
          </div>

          <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-300">
            <span className="p-1">{formatDate(email.timeReceived)}</span>
            <span className="relative ml-4 inline-flex">
              <span
                className="inline-flex h-8 w-8 cursor-pointer rounded-full p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
                onClick={() => {
                  startReply(email)
                }}
              >
                <ArrowUturnLeftIcon />
              </span>
              <span
                className="iline-flex h-8 w-8 cursor-pointer rounded-full p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
                onClick={() => {
                  startForward(email)
                }}
              >
                <ArrowUturnRightIcon />
              </span>
              <span
                className="inline-flex h-8 w-8 cursor-pointer rounded-full p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
                onClick={() => setShowMoreActions(!showMoreActions)}
              >
                <EllipsisVerticalIcon />
              </span>

              {showMoreActions && (
                <span
                  ref={showMoreActionsRef}
                  className="absolute right-0 top-8 w-28 select-none rounded-md border bg-white py-1 dark:border-neutral-600 dark:bg-neutral-800"
                >
                  <div
                    className="w-full cursor-pointer px-2 py-1 hover:bg-gray-100 dark:hover:bg-neutral-600"
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
          <div
            className={
              'email-sandbox dark:text-neutral-300' +
              (!email.html ? ' whitespace-pre-line' : '')
            }
          >
            <ErrorBoundary
              fallbackRender={({ error }) => {
                console.error(error)
                return (
                  <p className="text-rose-600 dark:text-rose-400 italic">
                    Rendering failed
                  </p>
                )
              }}
            >
              <div className="w-fit mx-auto">
                {parseEmailContent(
                  email,
                  configContext.state.config.disableProxy,
                  showImages
                )}
              </div>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </>
  )
}
