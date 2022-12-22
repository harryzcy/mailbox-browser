import { EmailInfo } from '../../services/emails'
import EmailTableRow from './EmailTableRow'

interface EmailTableViewProps {
  emails: EmailInfo[]
}

export default function EmailTableView(props: EmailTableViewProps) {
  const { emails = [] } = props

  return (
    <div className="grid">
      {emails.map((email) => {
        return <EmailTableRow key={email.messageID} email={email} />
      })}
    </div>
  )
}
