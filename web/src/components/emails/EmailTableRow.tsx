import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import { DraftEmailsContext } from 'contexts/DraftEmailContext'

import { EmailInfo, getEmail } from 'services/emails'

import { getNameFromEmails } from 'utils/emails'
import { formatDate } from 'utils/time'

interface EmailTableRowProps {
  email: EmailInfo
  selected: boolean
  onClick: (action: 'add' | 'replace') => void
}

export default function EmailTableRow(props: EmailTableRowProps) {
  const { email, onClick } = props
  const backgroundClassName = props.selected
    ? ' bg-blue-100 dark:bg-neutral-700'
    : ''
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

  const isMacLike = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent)

  return (
    <div
      className="group contents"
      onClick={(event) => {
        const shouldAdd =
          (isMacLike && event.metaKey) || (!isMacLike && event.ctrlKey)
        if (isMacLike) onClick(shouldAdd ? 'add' : 'replace')
      }}
      onDoubleClick={() => {
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
      }}
    >
      <div
        className={
          'relative cursor-pointer border-t border-neutral-200 px-4 py-2 group-first:border-0 dark:border-neutral-900 row-span-2 md:row-span-1' +
          backgroundClassName +
          unreadClassName
        }
      >
        {email.unread && (
          <span className="absolute inset-1/2 left-[7px] h-1 w-1 -translate-y-1/2 transform rounded-full bg-neutral-900 dark:bg-neutral-300"></span>
        )}
      </div>
      <div
        className={
          'relative cursor-pointer truncate border-t border-neutral-200 px-4 py-2 group-first:border-0 dark:border-neutral-900' +
          backgroundClassName +
          unreadClassName
        }
      >
        <span title={email.from && email.from.length > 0 ? email.from[0] : ''}>
          {getNameFromEmails(email.from)}
        </span>
      </div>
      <div
        className={
          'cursor-pointer truncate border-t border-neutral-200 px-4 py-2 group-first:border-0 dark:border-neutral-900 col-span-2 md:col-span-1' +
          backgroundClassName +
          unreadClassName
        }
      >
        {email.subject}
      </div>
      <div
        className={
          'cursor-pointer border-t border-neutral-200 px-4 py-2 text-right group-first:border-0 dark:border-neutral-900' +
          backgroundClassName +
          unreadClassName
        }
      >
        {formatDate(
          email.timeReceived || email.timeUpdated || email.timeSent || '',
          true
        )}
      </div>
    </div>
  )
}
