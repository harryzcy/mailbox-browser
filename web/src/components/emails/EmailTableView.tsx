import { useEffect, useRef } from 'react'
import useIsInViewport from '../../hooks/useIsInViewport'
import { EmailInfo } from '../../services/emails'
import EmailTableRow from './EmailTableRow'

interface EmailTableViewProps {
  emails: EmailInfo[]
  selected: string[]
  toggleSelected: (messageID: string, action: 'add' | 'replace') => void
  hasMore: boolean
  loadMoreEmails: () => void
}

export default function EmailTableView(props: EmailTableViewProps) {
  const { emails = [], toggleSelected, loadMoreEmails } = props

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const shouldLoadMore = useIsInViewport(loadMoreRef)
  useEffect(() => {
    if (shouldLoadMore) {
      loadMoreEmails()
    }
  }, [shouldLoadMore])

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

      <div
        ref={loadMoreRef}
        className="col-span-3 px-4 pt-2 pb-1 border-t dark:border-gray-900 dark:text-gray-500 text-sm text-center"
      >
        {props.hasMore ? 'Loading...' : 'No more emails'}
      </div>
    </div>
  )
}
