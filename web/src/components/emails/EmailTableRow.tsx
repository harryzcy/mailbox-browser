import { useNavigate } from 'react-router-dom'
import { EmailInfo } from '../../services/emails'
import { getNameFromEmails } from '../../utils/emails'
import { formatDate } from '../../utils/time'

interface EmailTableRowProps {
  email: EmailInfo
  selected: boolean
  onClick: (action: 'add' | 'replace') => void
}

export default function EmailTableRow(props: EmailTableRowProps) {
  const { email, onClick } = props
  const backgroundClassName = props.selected ? ' bg-blue-100' : ''

  const navigate = useNavigate()

  return (
    <div
      className="contents"
      onClick={(event) => {
        onClick(event.metaKey ? 'add' : 'replace')
      }}
      onDoubleClick={() => {
        navigate(`/inbox/${email.messageID}`)
      }}
    >
      <div className={'truncate px-4 py-2 border-b' + backgroundClassName}>
        <span title={email.from[0]}>{getNameFromEmails(email.from)}</span>
      </div>
      <div className={'truncate px-4 py-2 border-b' + backgroundClassName}>
        {email.subject}
      </div>
      <div className={'px-4 py-2 border-b text-right' + backgroundClassName}>
        {formatDate(email.timeReceived, true)}
      </div>
    </div>
  )
}
