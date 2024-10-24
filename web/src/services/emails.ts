export interface EmailInfo {
  messageID: string
  type: 'inbox' | 'draft' | 'sent'
  timeReceived: string | null
  timeUpdated: string | null
  timeSent: string | null
  subject: string
  from: string[]
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

export async function listEmails(
  props: ListEmailsProps
): Promise<ListEmailsResponse> {
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

  const response = await fetch('/web/emails?' + params.toString(), {
    method: 'GET'
  })
  return response.json() as Promise<ListEmailsResponse>
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

export async function getEmail(id: string): Promise<Email> {
  const response = await fetch(`/web/emails/${id}`)
  return response.json() as Promise<Email>
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

export async function getEmailRaw(messageID: string): Promise<string> {
  const response = await fetch(`/web/emails/${messageID}/raw`)
  return response.text()
}

export async function createEmail(email: CreateEmailProps): Promise<Email> {
  // TODO: should return error
  const response = await fetch('/web/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...email,
      generateText: 'off'
    })
  })
  return response.json() as Promise<Email>
}

export type SaveEmailProps = CreateEmailProps & {
  messageID: string
}

export async function saveEmail(email: SaveEmailProps): Promise<Email> {
  const response = await fetch(`/web/emails/${email.messageID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subject: email.subject,
      from: email.from,
      to: email.to,
      cc: email.cc,
      bcc: email.bcc,
      replyTo: email.replyTo,
      text: email.text,
      html: email.html,
      send: email.send
    })
  })
  return response.json() as Promise<Email>
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

export async function readEmail(messageID: string): Promise<void> {
  await fetch(`/web/emails/${messageID}/read`, {
    method: 'POST'
  })
}

export async function unreadEmail(messageID: string): Promise<void> {
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
