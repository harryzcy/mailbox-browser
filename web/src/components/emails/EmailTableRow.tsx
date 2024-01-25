import { CheckIcon } from '@heroicons/react/20/solid'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import EmailName from 'components/emails/EmailName'

import { DraftEmailsContext } from 'contexts/DraftEmailContext'

import { EmailInfo, getEmail } from 'services/emails'

import { formatDate } from 'utils/time'

interface EmailTableRowProps {
  email: EmailInfo
  selected: boolean
  onClick: () => void
}

export default function EmailTableRow(props: EmailTableRowProps) {
  const { email, onClick, selected } = props
  const backgroundClassName = selected ? ' bg-blue-100 dark:bg-neutral-700' : ''
  const unreadClassName = email.unread ? ' font-bold' : ' dark:font-light'

  const draftEmailsContext = useContext(DraftEmailsContext)

  const navigate = useNavigate()

  const openDraftEmail = async (messageID: string) => {
    const emailDetail = await getEmail(messageID)
    draftEmailsContext.dispatch({
      type: 'load',
      email: emailDetail
    })
  }

  const openEmail = () => {
    if (email.type === 'draft') {
      if (email.threadID) {
        navigate(`/inbox/thread/${email.threadID}`)
        return
      }
      void openDraftEmail(email.messageID)
    } else if (email.type === 'inbox' || email.type === 'sent') {
      if (email.threadID) {
        navigate(`/inbox/thread/${email.threadID}`)
        return
      }
      navigate(`/inbox/${email.messageID}`)
    }
  }

  return (
    <div className="group contents">
      <div
        className={
          'cursor-pointer border-t border-neutral-200 px-3 md:px-4 py-2 group-first:border-0 dark:border-neutral-900 row-span-2 md:row-span-1' +
          backgroundClassName +
          unreadClassName
        }
        onClick={() => {
          onClick()
        }}
      >
        <span className="h-full flex items-center">
          <div
            className={
              'h-4 w-4 border rounded ' +
              (selected
                ? 'border-neutral-900 dark:border-neutral-300'
                : 'border-neutral-300 dark:border-neutral-500')
            }
          >
            {selected && <CheckIcon className="h-3.5 w-3.5" />}
          </div>
        </span>
      </div>
      <div
        className={
          'cursor-pointer truncate border-t border-neutral-200 pl-1 pr-4 py-1 pt-2 md:py-2 group-first:border-0 dark:border-neutral-900' +
          backgroundClassName +
          unreadClassName
        }
        onClick={openEmail}
      >
        <span title={email.from && email.from.length > 0 ? email.from[0] : ''}>
          <EmailName emails={email.from} />
        </span>
      </div>
      <div
        className={
          'cursor-pointer truncate md:border-t border-neutral-200 pl-1 pr-4 pb-2 md:py-2 group-first:border-0 dark:border-neutral-900 col-span-2 md:col-span-1' +
          backgroundClassName +
          unreadClassName
        }
        onClick={openEmail}
      >
        {email.subject}
      </div>
      <div
        className={
          'cursor-pointer border-t border-neutral-200 px-4 py-1 pt-3 md:pt-2 text-right group-first:border-0 dark:border-neutral-900 text-xs md:text-base' +
          backgroundClassName +
          (email.unread ? ' md:font-bold' : ' md:dark:font-light')
        }
        onClick={openEmail}
      >
        {formatDate(
          email.timeReceived || email.timeUpdated || email.timeSent || '',
          { short: true }
        )}
      </div>
    </div>
  )
}
