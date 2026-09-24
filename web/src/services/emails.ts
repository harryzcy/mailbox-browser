import useSWR, { preload } from 'swr'
import useSWRInfinite from 'swr/infinite'
import useSWRMutation, { TriggerWithArgs } from 'swr/mutation'

import { isFeatureEnabled } from 'services/featureFlags'

export interface EmailInfo {
  messageID: string
  type: 'inbox' | 'draft' | 'sent'
  timeReceived: string | null
  timeUpdated: string | null
  timeSent: string | null
  subject: string
  from?: string[]
  to: string[]
  threadID: string
  isThreadLatest: true | undefined
  unread?: boolean
}

export interface ListEmailsProps {
  type: 'inbox' | 'draft' | 'sent'
  year?: number
  month?: number
  order?: 'asc' | 'desc'
  pageSize?: number
  nextCursor?: string
}

export interface ListEmailsResponse {
  count: number
  items: EmailInfo[]
  hasMore: boolean
  nextCursor?: string
}

export function listEmailsURL(props: ListEmailsProps): string {
  const { type, year, month, order, pageSize, nextCursor } = props
  const params = new URLSearchParams({
    type
  })
  if (year) {
    params.append('year', year.toString())
  }
  if (month) {
    params.append('month', month.toString())
  }
  if (order) {
    params.append('order', order)
  }
  if (pageSize) {
    params.append('pageSize', pageSize.toString())
  }
  if (nextCursor) {
    params.append('nextCursor', nextCursor)
  }
  return '/web/emails?' + params.toString()
}

const listEmailsFetcher = async (url: string): Promise<ListEmailsResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch emails with URL ${url}`)
  }
  return (await response.json()) as ListEmailsResponse
}

export interface UseEmailsResult {
  emails: EmailInfo[]
  hasMore: boolean
  loadMore: () => void
  error: Error | undefined
  updateEmails: (update: (emails: EmailInfo[]) => EmailInfo[]) => void
}

export function useEmails(
  props: Omit<ListEmailsProps, 'nextCursor'>,
  onError: (error: Error) => void
): UseEmailsResult {
  const getKey = (
    pageIndex: number,
    previousPageData: ListEmailsResponse | null
  ) => {
    if (pageIndex === 0) return listEmailsURL(props)
    if (!previousPageData?.hasMore || !previousPageData.nextCursor) return null
    return listEmailsURL({ ...props, nextCursor: previousPageData.nextCursor })
  }

  const { data, error, size, setSize, mutate } = useSWRInfinite<
    ListEmailsResponse,
    Error
  >(getKey, listEmailsFetcher, { onError })

  const lastPage = data?.at(-1)
  // A page is still loading while fewer pages have arrived than requested.
  const isLoadingMore = data === undefined || data.length < size
  return {
    emails: data?.flatMap((page) => page.items) ?? [],
    // Until the first page arrives there may be more to show.
    hasMore: lastPage?.hasMore ?? true,
    loadMore: () => {
      if (isLoadingMore || !lastPage?.hasMore) return
      void setSize(size + 1)
    },
    error,
    // Local edits after the server has already applied them, so no refetch.
    updateEmails: (update) => {
      void mutate(
        (pages) =>
          pages?.map((page) => ({ ...page, items: update(page.items) })),
        { revalidate: false }
      )
    }
  }
}

export interface File {
  contentID: string
  contentType: string
  contentTypeParams: Record<string, string>
  filename: string
}

export interface Email {
  messageID: string
  type: 'inbox' | 'draft' | 'sent'
  subject: string
  from: string[]
  to: string[]
  text: string
  html: string
  threadID?: string

  // inbox only
  timeReceived: string
  dateSent: string
  source: string
  destination: string[]
  returnPath: string
  verdict: EmailVerdict
  unread?: boolean

  // draft only
  timeUpdated: string
  cc: string[]
  bcc: string[]
  replyTo: string[]

  attachments: File[]
  inlines: File[]
  otherParts?: File[]

  // sent only
  timeSent: string
}

export interface EmailVerdict {
  spam: boolean
  dkim: boolean
  dmarc: boolean
  spf: boolean
  virus: boolean
}

const emailFetcher = async (url: string): Promise<Email> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch email with URL ${url}`)
  }
  return (await response.json()) as Email
}

export function useEmail(messageID: string | null): Email | undefined {
  const url = messageID ? `/web/emails/${messageID}` : null
  const { data } = useSWR<Email, Error>(url, emailFetcher)
  return data
}

export async function preloadEmail(messageID: string): Promise<void> {
  if (!(await isFeatureEnabled('preloadEmail'))) {
    return
  }
  await preload(`/web/emails/${messageID}`, emailFetcher)
}

export async function getEmail(messageID: string): Promise<Email> {
  const response = await fetch(`/web/emails/${messageID}`)
  return response.json() as Promise<Email>
}

interface UseEmailRawResult {
  raw: string | undefined
  isLoading: boolean
}

export function useEmailRaw(messageID: string): UseEmailRawResult {
  const { data, isLoading } = useSWR<string, Error>(
    `email-raw-${messageID}`,
    async () => {
      const response = await fetch(`/web/emails/${messageID}/raw`)
      return response.text()
    }
  )
  return {
    raw: data,
    isLoading
  }
}

export interface CreateEmailProps {
  subject: string
  from: string[]
  to: string[]
  cc: string[]
  bcc: string[]
  replyTo: string[]
  text: string
  html: string
  send: boolean
  replyEmailID?: string
}

export interface CreateEmailResult {
  trigger: TriggerWithArgs<Email, Error, '/web/emails', CreateEmailProps>
  isMutating: boolean
}

export function useCreateEmail(): CreateEmailResult {
  const { trigger, isMutating } = useSWRMutation<
    Email,
    Error,
    '/web/emails',
    CreateEmailProps
  >('/web/emails', async (url, { arg }: { arg: CreateEmailProps }) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...arg,
        generateText: 'off'
      })
    })
    return response.json() as Promise<Email>
  })
  return {
    trigger,
    isMutating
  }
}

export type SaveEmailProps = CreateEmailProps & {
  messageID: string
}

export interface SaveEmailResult {
  trigger: TriggerWithArgs<Email, Error, string, SaveEmailProps>
  isMutating: boolean
}

export function useSaveEmail(): SaveEmailResult {
  const { trigger, isMutating } = useSWRMutation<
    Email,
    Error,
    string | null,
    SaveEmailProps
  >('/web/emails/:messageID', async (_, { arg }: { arg: SaveEmailProps }) => {
    const url = `/web/emails/${arg.messageID}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: arg.subject,
        from: arg.from,
        to: arg.to,
        cc: arg.cc,
        bcc: arg.bcc,
        replyTo: arg.replyTo,
        text: arg.text,
        html: arg.html,
        send: arg.send
      })
    })
    return response.json() as Promise<Email>
  })
  return {
    trigger,
    isMutating
  }
}

export async function deleteEmail(messageID: string): Promise<void> {
  await fetch(`/web/emails/${messageID}`, {
    method: 'DELETE'
  })
}

export async function trashEmail(messageID: string): Promise<void> {
  await fetch(`/web/emails/${messageID}/trash`, {
    method: 'POST'
  })
}

export async function markEmailAsRead(messageID: string): Promise<void> {
  await fetch(`/web/emails/${messageID}/read`, {
    method: 'POST'
  })
}

export async function markEmailAsUnread(messageID: string): Promise<void> {
  await fetch(`/web/emails/${messageID}/unread`, {
    method: 'POST'
  })
}

export async function reparseEmail(messageID: string): Promise<void> {
  await fetch(`/web/emails/${messageID}/reparse`, {
    method: 'POST'
  })
}

export function generateLocalDraftID(): string {
  return `local-${Date.now().toString()}`
}

export function isLocalDraftID(id: string): boolean {
  return id.startsWith('local-')
}
