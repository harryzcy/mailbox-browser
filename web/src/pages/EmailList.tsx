import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import EmailMenuBar from 'components/emails/EmailMenuBar'
import EmailTableView from 'components/emails/EmailTableView'

import { useInboxContext } from 'contexts/InboxContext'

import { useOutsideClick } from 'hooks/useOutsideClick'

import {
  deleteEmail,
  readEmail,
  trashEmail,
  unreadEmail
} from 'services/emails'

export default function EmailList() {
  const {
    hasMore,
    emails,
    setEmails,
    year,
    month,
    setLoadMoreEmails,
    hasPreviousPage,
    goNextPage,
    goPreviousPage
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

  const toggleSelected = (messageID: string) => {
    if (selected.includes(messageID)) {
      setSelected(selected.filter((s) => s !== messageID))
    } else {
      setSelected([...selected, messageID])
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
      if (!email.unread) continue
      try {
        await readEmail(email.messageID)
      } catch (e) {
        console.error('Failed to mark email as read', e)
        toast.error('Failed to mark email as read')
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
      if (email.unread) continue
      try {
        await unreadEmail(email.messageID)
      } catch (e) {
        console.error('Failed to mark email as unread', e)
        toast.error('Failed to mark email as unread')
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
      <div ref={menuRef} className="preflight mb-4 px-2 md:px-0">
        <EmailMenuBar
          emailIDs={selected}
          handleBack={() => {
            setSelected([])
          }}
          showOperations={selected.length > 0}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          handleDelete={handleDelete}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          handleRead={handleRead}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          handleUnread={handleUnread}
          hasPrevious={hasPreviousPage}
          hasNext={true}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          goPrevious={goPreviousPage}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          goNext={goNextPage}
        >
          <span className="w-16">
            {year}-{month.toString().padStart(2, '0')}
          </span>
        </EmailMenuBar>
      </div>
      <div
        ref={emailViewRef}
        className="preflight mb-4 overflow-scroll rounded-md px-2 md:px-0"
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
          setLoadMoreEmails={setLoadMoreEmails}
        />
      </div>
    </>
  )
}
