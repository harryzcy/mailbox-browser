import { useEffect, useState } from 'react'
import { Outlet, useOutletContext } from 'react-router'
import { toast } from 'sonner'

import { EmailInfo, useEmails } from 'services/emails'

import {
  getCurrentYearMonth,
  getNextMonthYear,
  getPreviousMonthYear
} from 'utils/time'

export interface InboxContext {
  hasMore: boolean
  loadFailed: boolean
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
  goNextPage: () => void
  goPreviousPage: () => void
}

export function useInboxContext() {
  return useOutletContext<InboxContext>()
}

interface InboxContextOutletProps {
  type: 'inbox' | 'draft' | 'sent'
}

export function InboxContextOutlet(props: InboxContextOutletProps) {
  const [scrollYPosition, setScrollYPosition] = useState(0)

  const { year: initialYear, month: initialMonth } = getCurrentYearMonth()
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)

  const { emails, hasMore, loadMore, error, updateEmails } = useEmails(
    { type: props.type, year, month, order: 'desc' },
    (e) => {
      console.error('Failed to load emails', e)
    }
  )

  const loadFailed = error !== undefined

  useEffect(() => {
    // Toast once per failure, not on every SWR retry.
    if (loadFailed) {
      toast.error('Failed to load emails')
    }
  }, [loadFailed])

  const [shouldLoadMoreEmails, setShouldLoadMoreEmails] = useState(false)

  useEffect(() => {
    // loadMore ignores calls while a page is in flight, so this keeps loading
    // pages for as long as the end of the list stays in view.
    if (shouldLoadMoreEmails) {
      loadMore()
    }
  }, [shouldLoadMoreEmails, loadMore])

  const removeEmails = (messageIDs: string[]) => {
    updateEmails((items) =>
      items.filter((email) => !messageIDs.includes(email.messageID))
    )
  }

  const updateReadState = (messageIDs: string[], read: boolean) => {
    updateEmails((items) =>
      items.map((email) =>
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

  const { year: currentYear, month: currentMonth } = getCurrentYearMonth()
  const hasPreviousPage =
    currentYear > year || (currentYear === year && currentMonth > month)

  const goToMonth = (next: { year: number; month: number }) => {
    setYear(next.year)
    setMonth(next.month)
  }

  const goNextPage = () => {
    // Order is reversed, next button goes to previous month
    goToMonth(getPreviousMonthYear(month, year))
  }

  const goPreviousPage = () => {
    if (!hasPreviousPage) return
    // Order is reversed, back button goes to next month
    goToMonth(getNextMonthYear(month, year))
  }

  const outletContext: InboxContext = {
    hasMore,
    loadFailed,
    emails,
    year,
    month,
    removeEmails,
    markAsRead,
    markAsUnread,
    scrollYPosition,
    setScrollYPosition,
    setLoadMoreEmails: setShouldLoadMoreEmails,
    hasPreviousPage,
    goNextPage,
    goPreviousPage
  }

  return <Outlet context={outletContext} />
}
