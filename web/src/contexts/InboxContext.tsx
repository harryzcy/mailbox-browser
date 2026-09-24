import { useEffect, useState } from 'react'
import { Outlet, useOutletContext } from 'react-router'
import { toast } from 'sonner'

import { EmailInfo, listEmails } from 'services/emails'

import {
  getCurrentYearMonth,
  getNextMonthYear,
  getPreviousMonthYear
} from 'utils/time'

export interface InboxContext {
  hasMore: boolean
  emails: EmailInfo[]
  year: number
  month: number
  removeEmails: (messageIDs: string[]) => void
  markAsRead: (messageIDs: string[]) => void
  markAsUnread: (messageIDs: string[]) => void
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
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string>()
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
    const { nextCursor: inputNextCursor } = input

    const data = await listEmails({
      type: props.type,
      year: input.year ?? year,
      month: input.month ?? month,
      order: 'desc',
      nextCursor: inputNextCursor
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
    // loadMoreEmails is redefined every render and calls setEmails/setCount, so
    // depending on it would re-run this effect on its own output and loop for as
    // long as shouldLoadMoreEmails stays true. Fire only on the flag changing.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLoadMoreEmails])

  const removeEmails = (messageIDs: string[]) => {
    setEmails(emails.filter((email) => !messageIDs.includes(email.messageID)))
  }

  const updateReadState = (messageIDs: string[], read: boolean) => {
    setEmails(
      emails.map((email) =>
        messageIDs.includes(email.messageID)
          ? { ...email, unread: !read }
          : email
      )
    )
  }

  const markAsRead = (messageIDs: string[]) => {
    updateReadState(messageIDs, true)
  }

  const markAsUnread = (messageIDs: string[]) => {
    updateReadState(messageIDs, false)
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
      setHasMore(data.hasMore)
      setNextCursor(data.nextCursor)
    } catch (e) {
      console.error('Failed to load emails', e)
      toast.error('Failed to load emails')
    }
  }

  const [hasPreviousPage, setHasPreviousPage] = useState(false)

  useEffect(() => {
    const { year: currentYear, month: currentMonth } = getCurrentYearMonth()
    setHasPreviousPage(
      currentYear > year || (currentYear === year && currentMonth > month)
    )
  }, [year, month])

  const outletContext: InboxContext = {
    hasMore,
    emails,
    year,
    month,
    removeEmails,
    markAsRead,
    markAsUnread,
    scrollYPosition,
    setScrollYPosition,
    setLoadMoreEmails: setShouldLoadMoreEmails,
    hasPreviousPage: hasPreviousPage,
    goNextPage,
    goPreviousPage
  }

  return <Outlet context={outletContext} />
}
