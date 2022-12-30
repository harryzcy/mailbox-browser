/*
 * EmailRoot.tsx
 * This is the root component for inbox, draft, and sent pages.
 */

import { useContext, useEffect, useState } from 'react'
import { Outlet, useOutletContext } from 'react-router-dom'
import DraftEmailsTabs from '../components/emails/DraftEmailsTabs'
import FullScreenContent from '../components/emails/FullScreenContent'
import { DraftEmailsContext } from '../contexts/DraftEmailContext'
import { EmailInfo, listEmails, ListEmailsResponse } from '../services/emails'

type InboxContext = {
  count: number
  setCount: (count: number) => void
  hasMore: boolean
  setHasMore: (hasMore: boolean) => void
  nextCursor: string | undefined
  setNextCursor: (nextCursor: string | undefined) => void
  emails: EmailInfo[]
  setEmails: (emails: EmailInfo[]) => void
  loadingState: 'idle' | 'loading' | 'loaded' | 'error'
  setLoadingState: (
    loadingState: 'idle' | 'loading' | 'loaded' | 'error'
  ) => void
  year: number
  setYear: (year: number) => void
  month: number
  setMonth: (month: number) => void
  loadEmails: (input: {
    year: number
    month: number
    nextCursor?: string
  }) => Promise<ListEmailsResponse>
}

interface EmailRootProps {
  type: 'inbox' | 'draft' | 'sent'
}

export default function EmailRoot(props: EmailRootProps) {
  const [count, setCount] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [emails, setEmails] = useState<EmailInfo[]>([])

  const [loadingState, setLoadingState] = useState<
    'idle' | 'loading' | 'loaded' | 'error'
  >('idle')

  useEffect(() => {
    const abortController = new AbortController()
    setLoadingState('loading')
    loadAndSetEmails()
    return () => abortController.abort()
  }, [props.type])

  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)

  const loadEmails = async (input: {
    year?: number
    month?: number
    nextCursor?: string
  }) => {
    const { nextCursor } = input
    const data = await listEmails({
      type: props.type,
      year: input.year || year,
      month: input.month || month,
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

  const loadAndSetEmails = async (nextCursor?: string) => {
    setLoadingState('loading')
    const data = await loadEmails({
      nextCursor
    })
    setEmails(data.items)
    setCount(data.count)
    setHasMore(data.hasMore)
    setNextCursor(data.nextCursor)
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
    loadingState,
    setLoadingState,
    year,
    setYear,
    month,
    setMonth,
    loadEmails
  }

  const draftEmailsContext = useContext(DraftEmailsContext)

  return (
    <div className="flex-1 max-h-screen md:px-8 pt-2 md:pt-5">
      <div
        className={
          'flex flex-col ' +
          (draftEmailsContext.emails.length > 0
            ? 'h-[calc(100%-3rem)]'
            : 'h-full')
        }
      >
        <h1 className="text-lg font-light tracking-wider md:pb-4 md:px-2 dark:text-white">
          {props.type === 'inbox'
            ? 'Inbox'
            : props.type === 'draft'
            ? 'Drafts'
            : 'Sent'}
        </h1>
        <Outlet context={outletContext} />
      </div>

      <FullScreenContent />

      <DraftEmailsTabs />
    </div>
  )
}

export function useInboxContext() {
  return useOutletContext<InboxContext>()
}
