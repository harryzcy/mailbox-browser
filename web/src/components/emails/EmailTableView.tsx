import { useEffect, useRef } from 'react'

import useIsInViewport from 'hooks/useIsInViewport'

import { EmailInfo } from 'services/emails'

import EmailTableRow from './EmailTableRow'

interface EmailTableViewProps {
  emails: EmailInfo[]
  selected: string[]
  toggleSelected: (messageID: string) => void
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
    <div className="grid grid-flow-dense grid-cols-[min-content_1fr_1fr] md:grid-cols-[min-content_1fr_4fr_1fr] items-stretch select-none rounded bg-neutral-50 py-1 shadow-md dark:bg-neutral-800 dark:text-neutral-300 md:rounded-md">
      {emails.map((email) => {
        return (
          <EmailTableRow
            key={email.messageID}
            email={email}
            selected={props.selected.includes(email.messageID)}
            toggleSelect={() => {
              toggleSelected(email.messageID)
            }}
          />
        )
      })}

      <div
        ref={loadMoreRef}
        className={
          'col-span-3 md:col-span-4 px-4 py-1 pb-1 pr-4 text-center text-sm font-bold dark:border-neutral-900 dark:text-neutral-500' +
          (emails.length === 0 ? '' : ' border-t pt-2')
        }
      >
        {props.hasMore ? 'Loading...' : 'No more emails'}
      </div>
    </div>
  )
}
