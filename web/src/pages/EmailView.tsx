import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  EllipsisVerticalIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Await, useLoaderData, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { EmailDraft } from 'components/emails/EmailDraft'
import EmailMenuBar from 'components/emails/EmailMenuBar'
import EmailName from 'components/emails/EmailName'

import { DraftEmail, DraftEmailsContext } from 'contexts/DraftEmailContext'
import { useInboxContext } from 'contexts/InboxContext'

import { useOutsideClick } from 'hooks/useOutsideClick'

import { useConfig } from 'services/config'
import {
  CreateEmailProps,
  Email,
  generateLocalDraftID,
  readEmail,
  trashEmail,
  unreadEmail,
  useCreateEmail,
  useEmail,
  useSaveEmail
} from 'services/emails'
import { useThread } from 'services/threads'

import { parseEmailContent, parseEmailName } from 'utils/emails'
import { formatDate } from 'utils/time'

type EmailViewLoaderData =
  { type: 'email'; messageID: string } | { type: 'thread'; threadID: string }

export default function EmailView() {
  const data: EmailViewLoaderData = useLoaderData()

  const navigate = useNavigate()

  const email = useEmail(data.type === 'email' ? data.messageID : null)
  const { thread } = useThread(data.type === 'thread' ? data.threadID : null)

  const goPrevious = () => {}
  const goNext = () => {}

  const { activeEmail: activeReplyEmail, dispatch: dispatchDraftEmail } =
    useContext(DraftEmailsContext)
  const [isInitialReplyOpen, setIsInitialReplyOpen] = useState(false)

  const { config } = useConfig()

  const { trigger: triggerCreateEmail } = useCreateEmail()

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

    const createdEmail = await triggerCreateEmail(body)

    dispatchDraftEmail({
      type: 'update',
      messageID: draftID,
      email: createdEmail
    })
  }

  const startReply = async (targetEmail: Email) => {
    setIsInitialReplyOpen(true)
    const draftID = generateLocalDraftID()
    dispatchDraftEmail({
      type: 'new-reply',
      messageID: draftID,
      replyEmail: targetEmail,
      allowedAddresses: config?.emailAddresses ?? []
    })

    await startDraft(draftID)
  }

  const openReply = (targetEmail: Email) => {
    dispatchDraftEmail({
      type: 'load',
      email: targetEmail
    })
  }

  const draftElemRef = useRef<HTMLDivElement>(null)

  // isInitialReplyOpen is a trigger, not a value this effect reads.
  useEffect(() => {
    if (!draftElemRef.current) return
    draftElemRef.current.scrollIntoView()
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [isInitialReplyOpen])

  const startForward = async (targetEmail: Email) => {
    const draftID = generateLocalDraftID()
    dispatchDraftEmail({
      type: 'new-forward',
      messageID: draftID,
      forwardEmail: targetEmail
    })

    await startDraft(draftID)
  }

  const handleEmailChange = (draftEmail: DraftEmail) => {
    dispatchDraftEmail({
      type: 'update',
      messageID: draftEmail.messageID,
      email: draftEmail
    })
  }

  const { trigger: triggerSaveEmail } = useSaveEmail()

  const handleSend = async () => {
    const draftEmail = activeReplyEmail
    if (!draftEmail) return
    await triggerSaveEmail({
      messageID: draftEmail.messageID,
      subject: draftEmail.subject,
      from: draftEmail.from,
      to: draftEmail.to,
      cc: draftEmail.cc,
      bcc: draftEmail.bcc,
      replyTo: draftEmail.from,
      html: draftEmail.html,
      text: draftEmail.text,
      send: true // save and send
    })

    dispatchDraftEmail({
      type: 'remove',
      messageID: draftEmail.messageID
    })
  }

  const handleDelete = async () => {
    if ('threadID' in data) {
      // TODO
      throw new Error('Not yet supported')
    } else {
      await trashEmail(data.messageID)
    }
    await navigate(-1)
  }

  const handleRead = async () => {
    if ('threadID' in data) {
      // TODO
      throw new Error('Not yet supported')
    } else {
      try {
        await readEmail(data.messageID)
      } catch (e) {
        console.error('Failed to mark email as read', e)
        toast.error('Failed to mark email as read')
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
        console.error('Failed to mark email as unread', e)
        toast.error('Failed to mark email as unread')
      }
    }
  }

  const handleBack = async () => {
    await navigate(-1)
  }

  return (
    <>
      <div className="preflight mb-4 px-2 md:px-0">
        <EmailMenuBar
          emailIDs={'messageID' in data ? [data.messageID] : []}
          handleBack={() => {
            void handleBack()
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
          <div className="mb-4 overflow-scroll rounded-md bg-neutral-50 p-3 px-2 md:px-0 dark:bg-neutral-800 dark:text-neutral-200">
            <span className="px-2">Loading...</span>
          </div>
        }
      >
        {/* TODO: improve suspense handling & integration with swr */}
        {data.type === 'email' && email && (
          <Await resolve={email}>
            {(resolvedEmail: Email) => (
              <div className="h-full overflow-y-scroll px-2 pb-5 md:px-0">
                <div className="mb-2 px-3">
                  <span className="text-xl font-normal dark:text-neutral-200">
                    {resolvedEmail.subject}
                  </span>
                </div>
                <EmailBlock
                  email={resolvedEmail}
                  startReply={(targetEmail) => void startReply(targetEmail)}
                  startForward={(targetEmail) => void startForward(targetEmail)}
                />
                {activeReplyEmail &&
                  activeReplyEmail.replyEmail?.messageID ===
                    resolvedEmail.messageID && (
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

        {data.type === 'thread' && thread && (
          <div className="h-full overflow-scroll pb-5">
            <div className="mb-2 px-3">
              <span className="text-xl font-normal dark:text-neutral-200">
                {thread.subject}
              </span>
            </div>
            {thread.emails.map((threadEmail) => (
              <EmailBlock
                key={threadEmail.messageID}
                email={threadEmail}
                startReply={(targetEmail) => void startReply(targetEmail)}
                startForward={(targetEmail) => void startForward(targetEmail)}
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
              <div className="preflight mb-4 w-full rounded-md bg-neutral-50 p-3 dark:bg-neutral-800">
                <div className="flex items-start justify-between">
                  <span className="text-red-300">[Draft]</span>
                  <span className="text-neutral-500 dark:text-neutral-300">
                    {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                    <span
                      className="inline-flex size-8 cursor-pointer rounded-full p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
                      onClick={() => {
                        if (thread.draft) openReply(thread.draft)
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
      </React.Suspense>
    </>
  )
}

interface EmailBlockProps {
  email: Email
  startReply: (email: Email) => void
  startForward: (email: Email) => void
}

function EmailBlock(props: EmailBlockProps) {
  const { email, startForward, startReply } = props

  const [showMoreActions, setShowMoreActions] = React.useState(false)
  const showMoreActionsRef = useRef<HTMLSpanElement>(null)
  useOutsideClick(showMoreActionsRef, () => {
    setShowMoreActions(false)
  })

  const { config } = useConfig()

  const [showImages, setShowImages] = useState(config?.imagesAutoLoad ?? false)

  const { markAsRead } = useInboxContext()
  useEffect(() => {
    if (email.unread) {
      markAsRead(email.messageID)
    }
    // Mark-as-read is a one-shot on open. markAsRead is redefined every render
    // and calls setEmails, so depending on it would re-fire this effect.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    window.getSelection()?.removeAllRanges()
  }, [])

  const fromEmail = parseEmailName(email.from)

  return (
    <div className="mb-4 rounded-md bg-neutral-50 p-3 dark:bg-neutral-800">
      {!showImages && (
        <div className="preflight -mx-3 -mt-3 mb-3 flex gap-2 rounded-t-md border bg-gray-200 px-3 py-1 dark:bg-gray-700">
          <span>Images are not displayed</span>
          {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <span
            className="cursor-pointer text-blue-600 dark:text-blue-200"
            onClick={() => {
              setShowImages(true)
            }}
          >
            Display images below
          </span>
        </div>
      )}

      {/* header info for emails */}
      <div className="preflight flex items-start">
        <div className="w-full dark:text-neutral-300">
          <div className="mb-0.5 grid grid-flow-dense grid-cols-2 items-center justify-between gap-x-1 md:grid-cols-[min-content_1fr_min-content]">
            <div className="md:whitespace-nowrap">{fromEmail.name}</div>
            {fromEmail.address && (
              <div className="col-span-2 -mt-1 wrap-break-word md:col-span-1 md:mt-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {' <'}
                  {fromEmail.address}
                  {'>'}
                </span>
              </div>
            )}

            <div className="flex items-center justify-end text-sm text-neutral-500 dark:text-neutral-300">
              <span className="md:hidden md:px-1">
                {formatDate(email.timeReceived, { monthDayOnly: true })}
              </span>
              <span className="hidden py-1 md:inline md:px-1 md:whitespace-nowrap">
                {formatDate(email.timeReceived)}
              </span>

              <EmailActions
                email={email}
                startForward={startForward}
                startReply={startReply}
                showMoreActions={showMoreActions}
                setShowMoreActions={setShowMoreActions}
                showMoreActionsRef={showMoreActionsRef}
              />
            </div>
          </div>
          <div className="text-sm">
            <span>To: </span>
            <EmailName emails={email.to} showAddress />
          </div>
        </div>
      </div>

      {/* email body */}
      <div className="mt-4">
        <div
          className={clsx(
            'email-sandbox dark:text-neutral-300',
            !email.html && 'whitespace-pre-line'
          )}
        >
          <ErrorBoundary
            // oxlint-disable-next-line react/no-unstable-nested-components
            fallbackRender={({ error }) => {
              console.error(error)
              return (
                <p className="text-rose-600 italic dark:text-rose-400">
                  Rendering failed
                </p>
              )
            }}
          >
            <div className="mx-auto w-fit max-w-full overflow-x-auto">
              {parseEmailContent(
                email,
                config?.disableProxy ?? false,
                showImages
              )}
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

function EmailActions(props: {
  email: Email
  startReply: (email: Email) => void
  startForward: (email: Email) => void
  showMoreActions: boolean
  setShowMoreActions: (show: boolean) => void
  showMoreActionsRef: React.RefObject<HTMLSpanElement | null>
}) {
  const {
    email,
    startReply,
    startForward,
    showMoreActions,
    setShowMoreActions,
    showMoreActionsRef
  } = props
  return (
    <span className="relative ml-2 inline-flex md:ml-4">
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <span
        className="inline-flex size-6 cursor-pointer rounded-full p-1 hover:bg-neutral-200 md:size-8 md:p-2 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
        onClick={() => {
          startReply(email)
        }}
      >
        <ArrowUturnLeftIcon />
      </span>
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <span
        className="inline-flex size-6 cursor-pointer rounded-full p-1 hover:bg-neutral-200 md:size-8 md:p-2 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
        onClick={() => {
          startForward(email)
        }}
      >
        <ArrowUturnRightIcon />
      </span>
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <span
        className="inline-flex size-6 cursor-pointer rounded-full p-1 hover:bg-neutral-200 md:size-8 md:p-2 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
        onClick={() => {
          setShowMoreActions(!showMoreActions)
        }}
      >
        <EllipsisVerticalIcon />
      </span>

      {showMoreActions && (
        <span
          ref={showMoreActionsRef}
          className="absolute top-8 right-0 w-28 rounded-md border bg-white py-1 select-none dark:border-neutral-600 dark:bg-neutral-800"
        >
          {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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
  )
}
