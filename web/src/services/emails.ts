export interface EmailInfo {
  messageID: string
  type: 'inbox' | 'draft' | 'sent'
  timeReceived: string
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
  Cc: string[]
  Bcc: string[]
  ReplyTo: string[]
}

export type EmailVerdict = {
  spam: boolean
  dkim: boolean
  dmarc: boolean
  spf: boolean
  virus: boolean
}

export async function getEmail(id: string) {
  const response = await fetch(`/web/emails/${id}`)
  return response.json()
}
