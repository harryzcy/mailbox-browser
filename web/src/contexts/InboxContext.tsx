import { Outlet, useOutletContext } from 'react-router'

import { EmailInfo, ListEmailsResponse } from 'services/emails'

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
}

export function useInboxContext() {
  return useOutletContext<InboxContext>()
}

interface InboxContextProviderProps {
  context: InboxContext
}

export function InboxContextOutlet(props: InboxContextProviderProps) {
  return <Outlet context={props.context} />
}
