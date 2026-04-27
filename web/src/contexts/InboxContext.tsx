import { useEffect, useState } from 'react'
import { Outlet, useOutletContext } from 'react-router'
import { toast } from 'sonner'

import { EmailInfo, ListEmailsResponse, listEmails } from 'services/emails'

import { getCurrentYearMonth } from 'utils/time'

export interface InboxContext {
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
  setLoadMoreEmails: (loadMore: boolean) => void
}

export function useInboxContext() {
  return useOutletContext<InboxContext>()
}

interface InboxContextOutletProps {
  type: 'inbox' | 'draft' | 'sent'
}

export function InboxContextOutlet(props: InboxContextOutletProps) {
  const [count, setCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [scrollYPosition, setScrollYPosition] = useState(0)

  const { year: initialYear, month: initialMonth } = getCurrentYearMonth()
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)

  const [emails, setEmails] = useState<EmailInfo[]>([])

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
    return data
  }

  const [shouldLoadMoreEmails, setShouldLoadMoreEmails] = useState(false)

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
      console.error('Failed to load emails', e)
      toast.error('Failed to load emails')
    }
  }

  useEffect(() => {
    if (shouldLoadMoreEmails) {
      void loadMoreEmails()
    }
  }, [shouldLoadMoreEmails])

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
    setScrollYPosition,
    setLoadMoreEmails: setShouldLoadMoreEmails
  }

  return <Outlet context={outletContext} />
}
