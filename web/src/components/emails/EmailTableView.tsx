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
      className="grid select-none rounded bg-neutral-50 py-1 shadow-md dark:bg-neutral-800 dark:text-neutral-300 md:rounded-md"
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
        className={
          'col-span-3 px-4 py-1 pb-1 pr-[4%] text-center text-sm font-bold dark:border-neutral-900 dark:text-neutral-500' +
          (emails.length === 0 ? '' : ' border-t pt-2')
        }
      >
        {props.hasMore ? 'Loading...' : 'No more emails'}
      </div>
    </div>
  )
}
