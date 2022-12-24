import { useEffect, useRef, useState } from 'react'
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
    setNextCursor,
    emails,
    setEmails,
    year,
    month,
    loadEmails
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

  const [hasPrevious, setHasPrevious] = useState<boolean>(false)

  const goPrevious = async () => {
    if (!hasPrevious) return

    let newMonth = month + 1
    let newYear = year
    if (newMonth === 13) {
      newMonth = 1
      newYear = year + 1
    }

    let data = await loadEmails({
      year: newYear,
      month: newMonth
    })
    setEmails(data.items)
    setCount(data.count)
    setHasMore(data.hasMore)
    setNextCursor(data.nextCursor)
  }

  const goNext = async () => {
    let newMonth = month - 1
    let newYear = year
    if (newMonth === 0) {
      newMonth = 12
      newYear = year - 1
    }

    const data = await loadEmails({
      year: newYear,
      month: newMonth
    })
    setEmails(data.items)
    setCount(data.count)
    setHasMore(data.hasMore)
    setNextCursor(data.nextCursor)
  }

  useEffect(() => {
    setHasPrevious(checkHasPrevious())
  }, [year, month])

  const checkHasPrevious = () => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    return currentYear > year || (currentYear === year && currentMonth > month)
  }

  return (
    <>
      <div ref={menuRef} className="mb-4">
        <EmailMenuBar
          hasPrevious={hasPrevious}
          hasNext={hasMore}
          goPrevious={goPrevious}
          goNext={goNext}
        >
          <span>
            {year}-{month}
          </span>
        </EmailMenuBar>
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
