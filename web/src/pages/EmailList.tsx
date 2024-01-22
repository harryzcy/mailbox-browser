import { useEffect, useRef, useState } from 'react'

import EmailMenuBar from 'components/emails/EmailMenuBar'
import EmailTableView from 'components/emails/EmailTableView'
import { toast } from 'components/ui/use-toast'

import { useOutsideClick } from 'hooks/useOutsideClick'

import {
  deleteEmail,
  readEmail,
  trashEmail,
  unreadEmail
} from 'services/emails'

import { getCurrentYearMonth } from 'utils/time'

import { useInboxContext } from './EmailRoot'

export default function EmailList() {
  const {
    count,
    setCount,
    hasMore,
    setHasMore,
    nextCursor,
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
  const { scrollYPosition, setScrollYPosition } = useInboxContext()
  useEffect(() => {
    emailViewRef.current?.scrollTo(0, scrollYPosition)
  }, [emailViewRef.current])

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

    try {
      const data = await loadEmails({
        year: newYear,
        month: newMonth
      })
      setEmails(data.items)
      setCount(data.count)
      setHasMore(data.hasMore)
      setNextCursor(data.nextCursor)
    } catch (e) {
      toast({
        title: 'Failed to load emails'
      })
    }
  }

  const goNext = async () => {
    let newMonth = month - 1
    let newYear = year
    if (newMonth === 0) {
      newMonth = 12
      newYear = year - 1
    }

    try {
      const data = await loadEmails({
        year: newYear,
        month: newMonth
      })
      setEmails(data.items)
      setCount(data.count)
      setHasMore(data.hasMore)
      setNextCursor(data.nextCursor)
    } catch (e) {
      toast({
        title: 'Failed to load emails'
      })
    }
  }

  useEffect(() => {
    setHasPrevious(checkHasPrevious())
  }, [year, month])

  const checkHasPrevious = () => {
    const { year: currentYear, month: currentMonth } = getCurrentYearMonth()
    return currentYear > year || (currentYear === year && currentMonth > month)
  }

  const loadMoreEmails = async () => {
    if (!hasMore) return
    try {
      const data = await loadEmails({
        year,
        month,
        nextCursor
      })
      setEmails([...emails, ...data.items])
      setCount(data.count + count)
      setHasMore(data.hasMore)
      setNextCursor(data.nextCursor)
    } catch (e) {
      toast({
        title: 'Failed to load emails'
      })
    }
  }

  const handleDelete = async () => {
    const emailsToBeDeleted = emails.filter((e) =>
      selected.includes(e.messageID)
    )
    for (const email of emailsToBeDeleted) {
      if (email.type === 'draft') {
        await deleteEmail(email.messageID)
      } else {
        await trashEmail(email.messageID)
      }
    }
    setEmails(emails.filter((e) => !selected.includes(e.messageID)))
    setSelected([])
  }

  const handleRead = async () => {
    const selectedEmails = emails.filter((e) => selected.includes(e.messageID))
    for (const email of selectedEmails) {
      try {
        await readEmail(email.messageID)
      } catch (e) {
        toast({
          title: 'Failed to mark email as read'
        })
      }
    }
    setEmails(
      emails.map((e) => {
        if (selected.includes(e.messageID)) {
          return {
            ...e,
            unread: false
          }
        }
        return e
      })
    )
    setSelected([])
  }

  const handleUnread = async () => {
    const selectedEmails = emails.filter((e) => selected.includes(e.messageID))
    for (const email of selectedEmails) {
      try {
        await unreadEmail(email.messageID)
      } catch (e) {
        toast({
          title: 'Failed to mark email as unread'
        })
      }
    }
    setEmails(
      emails.map((e) => {
        if (selected.includes(e.messageID)) {
          return {
            ...e,
            unread: true
          }
        }
        return e
      })
    )
    setSelected([])
  }

  return (
    <>
      <div ref={menuRef} className="preflight mb-4">
        <EmailMenuBar
          emailIDs={selected}
          handleBack={() => setSelected([])}
          showOperations={selected.length > 0}
          handleDelete={handleDelete}
          handleRead={handleRead}
          handleUnread={handleUnread}
          hasPrevious={hasPrevious}
          hasNext={true}
          goPrevious={goPrevious}
          goNext={goNext}
        >
          <span className="w-16">
            {year}-{month.toString().padStart(2, '0')}
          </span>
        </EmailMenuBar>
      </div>
      <div
        ref={emailViewRef}
        className="preflight mb-4 overflow-scroll rounded-md"
        onScroll={() => {
          if (!emailViewRef.current) return
          setScrollYPosition(emailViewRef.current.scrollTop)
        }}
      >
        <EmailTableView
          emails={emails}
          selected={selected}
          toggleSelected={toggleSelected}
          hasMore={hasMore}
          loadMoreEmails={loadMoreEmails}
        />
      </div>
    </>
  )
}
