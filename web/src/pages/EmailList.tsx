import { useRef, useState } from 'react'
import EmailMenuBar from '../components/emails/EmailMenuBar'
import EmailTableView from '../components/emails/EmailTableView'
import { useOutsideClick } from '../hooks/useOutsideClick'
import { ListEmailsResponse } from '../services/emails'
import { useInboxContext } from './Inbox'

export default function EmailList() {
  const {
    setCount,
    hasMore,
    setHasMore,
    nextCursor,
    setNextCursor,
    emails,
    setEmails,
    loadEmails,
    previousPages,
    setPreviousPages
  } = useInboxContext()

  const [selected, setSelected] = useState<string[]>([])

  const menuRef = useRef<HTMLDivElement>(null)
  const emailViewRef = useRef<HTMLDivElement>(null)
  useOutsideClick([menuRef, emailViewRef], () => {
    setSelected([])
  })

  const toggleSelected = (messageID: string, action: 'add' | 'replace') => {
    if (action === 'replace') {
      setSelected([messageID])
      return
    }

    if (selected.includes(messageID)) {
      setSelected(selected.filter((s) => s !== messageID))
    } else {
      setSelected([...selected, messageID])
    }
  }

  const goPrevious = async () => {
    if (previousPages.length === 0) {
      return
    }

    let data: ListEmailsResponse
    if (previousPages.length === 1) {
      data = await loadEmails()
    } else {
      // the last cursor is for the current page
      // the second last cursor is for the previous page
      data = await loadEmails(previousPages[previousPages.length - 2])
    }

    setEmails(data.items)
    setCount(data.count)
    setHasMore(data.hasMore)
    setNextCursor(data.nextCursor)
    setPreviousPages(previousPages.slice(0, previousPages.length - 1))
  }

  const goNext = async () => {
    if (!nextCursor) {
      return
    }

    const data = await loadEmails(nextCursor)
    setPreviousPages([...previousPages, nextCursor])
    setEmails(data.items)
    setCount(data.count)
    setHasMore(data.hasMore)
    setNextCursor(data.nextCursor)
  }

  return (
    <>
      <div ref={menuRef} className="mb-4">
        <EmailMenuBar
          hasPrevious={previousPages.length !== 0}
          hasNext={hasMore}
          goPrevious={goPrevious}
          goNext={goNext}
        />
      </div>
      <div ref={emailViewRef}>
        <EmailTableView
          emails={emails}
          selected={selected}
          toggleSelected={toggleSelected}
        />
      </div>
    </>
  )
}
