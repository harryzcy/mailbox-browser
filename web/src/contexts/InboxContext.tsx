import { useEffect, useState } from 'react'
import { Outlet, useOutletContext } from 'react-router'
import { toast } from 'sonner'

import { EmailInfo, ListEmailsResponse, listEmails } from 'services/emails'

import {
  getCurrentYearMonth,
  getNextMonthYear,
  getPreviousMonthYear
} from 'utils/time'

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
  hasPreviousPage: boolean
  goNextPage: () => Promise<void>
  goPreviousPage: () => Promise<void>
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

  const goNextPage = async () => {
    // Order is reversed, next button goes to previous month
    const { month: newMonth, year: newYear } = getPreviousMonthYear(month, year)
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
      console.error('Failed to load emails', e)
      toast.error('Failed to load emails')
    }
  }

  const goPreviousPage = async () => {
    if (!hasPreviousPage) return
    // Order is reversed, back button goes to next month
    const { month: newMonth, year: newYear } = getNextMonthYear(month, year)
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
      console.error('Failed to load emails', e)
      toast.error('Failed to load emails')
    }
  }

  const checkHasPrevious = () => {
    const { year: currentYear, month: currentMonth } = getCurrentYearMonth()
    return currentYear > year || (currentYear === year && currentMonth > month)
  }

  const [hasPreviousPage, setHasPreviousPage] = useState(false)

  useEffect(() => {
    setHasPreviousPage(checkHasPrevious())
  }, [year, month])

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
    setLoadMoreEmails: setShouldLoadMoreEmails,
    hasPreviousPage: hasPreviousPage,
    goNextPage,
    goPreviousPage
  }

  return <Outlet context={outletContext} />
}
