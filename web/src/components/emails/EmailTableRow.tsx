import { useNavigate } from 'react-router-dom'
import { EmailInfo } from '../../services/emails'

interface EmailTableRowProps {
  email: EmailInfo
  selected: boolean
  onClick: (action: 'add' | 'replace') => void
}

export default function EmailTableRow(props: EmailTableRowProps) {
  const { email, onClick } = props
  const backgroundClassName = props.selected ? ' bg-blue-100' : ''

  const navigate = useNavigate();

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
        <span title={email.from[0]}>{getFromText(email.from)}</span>
      </div>
      <div className={'truncate px-4 py-2 border-b' + backgroundClassName}>
        {email.subject}
      </div>
      <div className={'px-4 py-2 border-b text-right' + backgroundClassName}>
        {formatDate(email.timeReceived)}
      </div>
    </div>
  )
}

function getFromText(from: string[]): string {
  const regex = /(.*?) ?<.*?>/g
  const match = regex.exec(from[0])
  if (match) {
    return match[1]
  }
  return from[0]
}

function formatDate(date: string): string {
  const dateObj = new Date(date)
  const now = new Date()

  // If the date is today, show the time
  if (
    dateObj.getFullYear() == now.getFullYear() &&
    dateObj.getMonth() == now.getMonth() &&
    dateObj.getDate() == now.getDate()
  ) {
    const hour = dateObj.getHours()
    const minutesStr = dateObj.getMinutes().toString().padStart(2, '0')
    const meridian = hour >= 12 ? 'PM' : 'AM'
    return `${hour % 12 || 12}:${minutesStr} ${meridian}`
  }

  // If the date is in current year, show the month and day
  if (dateObj.getFullYear() == now.getFullYear()) {
    const month = dateObj.toLocaleString('default', { month: 'short' })
    const day = dateObj.getDate()
    return `${month} ${day}`
  }

  // Otherwise, show the full date
  let year = dateObj.getFullYear()
  if (year > 2000) year -= 2000 // Show 2-digit year
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  return `${month}/${day}/${year}`
}
