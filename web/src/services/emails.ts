export interface EmailInfo {
  messageID: string
  type: 'inbox' | 'draft' | 'sent'
  timeReceived: string | null
  timeUpdated: string | null
  timeSent: string | null
  subject: string
  from: string[]
  to: string[]
}

export type ListEmailsProps = {
  type: 'inbox' | 'draft' | 'sent'
  year?: number
  month?: number
  order?: 'asc' | 'desc'
  pageSize?: number
  nextCursor?: string
}

export type ListEmailsResponse = {
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

  const response = await fetch('/web/emails?' + params, {
    method: 'GET'
  })
  return response.json()
}

export type Email = {
  messageID: string
  type: 'inbox' | 'draft' | 'sent'
  subject: string
  from: string[]
  to: string[]
  text: string
  html: string

  // inbox only
  timeReceived: string
  dateSent: string
  source: string
  destination: string[]
  returnPath: string
  verdict: EmailVerdict

  // draft only
  timeUpdated: string
  cc: string[]
  bcc: string[]
  replyTo: string[]
}

export type EmailVerdict = {
  spam: boolean
  dkim: boolean
  dmarc: boolean
  spf: boolean
  virus: boolean
}

export async function getEmail(id: string): Promise<Email> {
  const response = await fetch(`/web/emails/${id}`)
  return response.json()
}

export type CreateEmailProps = {
  subject: string
  from: string[]
  to: string[]
  cc: string[]
  bcc: string[]
  replyTo: string[]
  text: string
  html: string
  send: boolean
}

export async function createEmail(email: CreateEmailProps): Promise<Email> {
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
  return response.json()
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
  return response.json()
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

export function generateLocalDraftID(): string {
  return `local-${Date.now().toString()}`
}

export function isLocalDraftID(id: string): boolean {
  return id.startsWith('local-')
}
