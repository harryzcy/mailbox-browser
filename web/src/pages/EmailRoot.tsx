/*
 * EmailRoot.tsx
 * This is the root component for inbox, draft, and sent pages.
 */
import { useContext, useState } from 'react'
import { Outlet, useOutletContext } from 'react-router'

import DraftEmailsTabs from 'components/emails/DraftEmailsTabs'
import FullScreenContent from 'components/emails/FullScreenContent'

import { DraftEmailsContext } from 'contexts/DraftEmailContext'

import { EmailInfo, ListEmailsResponse, listEmails } from 'services/emails'

import { getCurrentYearMonth } from 'utils/time'

interface InboxContext {
  count: number
  setCount: (count: number) => void
  hasMore: boolean
  setHasMore: (hasMore: boolean) => void
  nextCursor: string | undefined
  setNextCursor: (nextCursor: string | undefined) => void
  emails: EmailInfo[]
  setEmails: (emails: EmailInfo[]) => void
  year: number
  setYear: (year: number) => void
  month: number
  setMonth: (month: number) => void
  loadEmails: (input: {
    year: number
    month: number
    nextCursor?: string
  }) => Promise<ListEmailsResponse>
  markAsRead: (messageID: string) => void
  scrollYPosition: number
  setScrollYPosition: (yPosition: number) => void
}

interface EmailRootProps {
  type: 'inbox' | 'draft' | 'sent'
}

export default function EmailRoot(props: EmailRootProps) {
  const [count, setCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [emails, setEmails] = useState<EmailInfo[]>([])
  const [scrollYPosition, setScrollYPosition] = useState(0)

  const { year: initialYear, month: initialMonth } = getCurrentYearMonth()
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)

  const loadEmails = async (input: {
    year?: number
    month?: number
    nextCursor?: string
  }) => {
    const { nextCursor } = input

    const data = await listEmails({
      type: props.type,
      year: input.year ?? year,
      month: input.month ?? month,
      order: 'desc',
      nextCursor
    })

    if (input.year) {
      setYear(input.year)
    }
    if (input.month) {
      setMonth(input.month)
    }

    setLoadingState('loaded')
    return data
  }

  const removeEmailFromList = (messageID: string) => {
    setEmails(emails.filter((email) => email.messageID !== messageID))
  }

  const markAsRead = (messageID: string) => {
    setEmails(
      emails.map((email) => {
        if (email.messageID === messageID) {
          return {
            ...email,
            unread: false
          }
        }
        return email
      })
    )
  }

  const outletContext: InboxContext = {
    count,
    setCount,
    hasMore,
    setHasMore,
    nextCursor,
    setNextCursor,
    emails,
    setEmails,
    year,
    setYear,
    month,
    setMonth,
    loadEmails,
    markAsRead,
    scrollYPosition,
    setScrollYPosition
  }

  const draftEmailsContext = useContext(DraftEmailsContext)

  return (
    <>
      <div
        className={
          'flex flex-col ' +
          (draftEmailsContext.emails.length > 0
            ? 'h-[calc(100%-3rem)]'
            : 'h-full')
        }
      >
        <div className="preflight">
          <h1 className="text-lg w-full font-light tracking-wider text-center md:text-left dark:text-white px-2 pb-3 md:px-2 md:pb-4">
            {props.type === 'inbox'
              ? 'Inbox'
              : props.type === 'draft'
                ? 'Drafts'
                : 'Sent'}
          </h1>
        </div>
        <Outlet context={outletContext} />
      </div>

      <div className="preflight">
        <FullScreenContent
          handleDelete={(messageID) => {
            removeEmailFromList(messageID)
          }}
        />
      </div>

      <div className="preflight">
        <DraftEmailsTabs />
      </div>
    </>
  )
}

export function useInboxContext() {
  return useOutletContext<InboxContext>()
}
