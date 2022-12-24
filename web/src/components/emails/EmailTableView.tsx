import { EmailInfo } from '../../services/emails'
import EmailTableRow from './EmailTableRow'

interface EmailTableViewProps {
  emails: EmailInfo[]
  selected: string[]
  toggleSelected: (messageID: string, action: 'add' | 'replace') => void
}

export default function EmailTableView(props: EmailTableViewProps) {
  const { emails = [], toggleSelected } = props

  return (
    <div
      className="grid py-1 rounded md:rounded-md bg-gray-50 dark:bg-gray-800 dark:text-gray-300 select-none"
      style={{
        gridTemplateColumns: '1fr 4fr 1fr'
      }}
    >
      {emails.map((email) => {
        return (
          <EmailTableRow
            key={email.messageID}
            email={email}
            selected={props.selected.includes(email.messageID)}
            onClick={(action) => {
              toggleSelected(email.messageID, action)
            }}
          />
        )
      })}
    </div>
  )
}
