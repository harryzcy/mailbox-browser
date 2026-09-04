import { CheckIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router'

import EmailName from 'components/emails/EmailName'

import { DraftEmailsContext } from 'contexts/DraftEmailContext'

import { EmailInfo, getEmail, preloadEmail } from 'services/emails'

import { EMAIL_PRELOAD_DELAY } from 'utils/constants'
import { formatDate } from 'utils/time'

interface EmailTableRowProps {
  email: EmailInfo
  selected: boolean
  toggleSelect: () => void
}

export default function EmailTableRow(props: EmailTableRowProps) {
  const { email, toggleSelect, selected } = props
  const backgroundClassName = selected ? 'bg-blue-100 dark:bg-neutral-700' : ''
  const unreadClassName = email.unread ? 'font-bold' : 'dark:font-light'

  const draftEmailsContext = useContext(DraftEmailsContext)

  const navigate = useNavigate()

  const openDraftEmail = async (messageID: string) => {
    const emailDetail = await getEmail(messageID)
    draftEmailsContext.dispatch({
      type: 'load',
      email: emailDetail
    })
  }

  const openEmail = async () => {
    if (email.type === 'draft') {
      if (email.threadID) {
        await navigate(`/inbox/thread/${email.threadID}`)
        return
      }
      void openDraftEmail(email.messageID)
    } else if (email.type === 'inbox' || email.type === 'sent') {
      if (email.threadID) {
        await navigate(`/inbox/thread/${email.threadID}`)
        return
      }
      await navigate(`/inbox/${email.messageID}`)
    }
  }

  const [mouseOverDelayHandler, setMouseOverDelayHandler] = useState<
    number | null
  >(null)

  const handleMouseEnter = () => {
    if (mouseOverDelayHandler) {
      clearTimeout(mouseOverDelayHandler)
    }
    setMouseOverDelayHandler(
      setTimeout(() => {
        console.log('Preloading email', email.messageID)
        void preloadEmail(email.messageID)
      }, EMAIL_PRELOAD_DELAY)
    )
  }

  const handleMouseLeave = () => {
    if (mouseOverDelayHandler) {
      clearTimeout(mouseOverDelayHandler)
      setMouseOverDelayHandler(null)
    }
  }

  return (
    <div className="group contents">
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={clsx(
          'row-span-2 cursor-pointer border-t border-neutral-200 px-3 py-2 group-first:border-0 md:row-span-1 md:px-4 dark:border-neutral-900',
          backgroundClassName,
          unreadClassName
        )}
        onClick={toggleSelect}
      >
        <span className="flex h-full items-center">
          <div
            className={clsx(
              'size-4 rounded border',
              selected
                ? 'border-neutral-900 dark:border-neutral-300'
                : 'border-neutral-300 dark:border-neutral-500'
            )}
          >
            {selected && <CheckIcon className="size-3.5" />}
          </div>
        </span>
      </div>
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={clsx(
          'cursor-pointer truncate border-t border-neutral-200 py-1 pt-2 pr-4 pl-1 group-first:border-0 md:py-2 dark:border-neutral-900',
          backgroundClassName,
          unreadClassName
        )}
        onClick={() => {
          void openEmail()
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span title={email.from && email.from.length > 0 ? email.from[0] : ''}>
          <EmailName emails={email.from ?? []} />
        </span>
      </div>
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={clsx(
          'col-span-2 cursor-pointer truncate border-neutral-200 pr-4 pb-2 pl-1 group-first:border-0 md:col-span-1 md:border-t md:py-2 dark:border-neutral-900',
          backgroundClassName,
          unreadClassName
        )}
        onClick={() => {
          void openEmail()
        }}
      >
        {email.subject}
      </div>
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={clsx(
          'cursor-pointer border-t border-neutral-200 px-4 py-1 pt-3 text-right text-xs group-first:border-0 md:pt-2 md:text-base dark:border-neutral-900',
          backgroundClassName,
          email.unread ? 'md:font-bold' : 'md:dark:font-light'
        )}
        onClick={() => {
          void openEmail()
        }}
      >
        {formatDate(
          email.timeReceived ?? email.timeUpdated ?? email.timeSent ?? '',
          { short: true }
        )}
      </div>
    </div>
  )
}
