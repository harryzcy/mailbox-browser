import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { DraftEmailsContext } from '../../contexts/DraftEmailContext'
import { EmailInfo, getEmail } from '../../services/emails'
import { getNameFromEmails } from '../../utils/emails'
import { formatDate } from '../../utils/time'

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

  const draftEmailsContext = useContext(DraftEmailsContext)

  const navigate = useNavigate()

  const openDraftEmail = async (messageID: string) => {
    const emailDetail = await getEmail(messageID)
    draftEmailsContext.dispatch({
      type: 'load',
      email: emailDetail
    })
  }

  return (
    <div
      className="contents group"
      onClick={(event) => {
        onClick(event.metaKey ? 'add' : 'replace')
      }}
      onDoubleClick={() => {
        if (email.type === 'draft') {
          openDraftEmail(email.messageID)
          if (email.threadID) {
            navigate(`/inbox/thread/${email.threadID}`)
            return
          }
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
          'truncate px-4 py-2 cursor-pointer border-t group-first:border-0 border-neutral-200 dark:border-neutral-900' +
          backgroundClassName
        }
      >
        <span title={email.from && email.from.length > 0 ? email.from[0] : ''}>
          {getNameFromEmails(email.from)}
        </span>
      </div>
      <div
        className={
          'truncate px-4 py-2 cursor-pointer border-t group-first:border-0 border-neutral-200 dark:border-neutral-900' +
          backgroundClassName
        }
      >
        {email.subject}
      </div>
      <div
        className={
          'px-4 py-2 cursor-pointer border-t group-first:border-0 border-neutral-200 dark:border-neutral-900 text-right' +
          backgroundClassName
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
