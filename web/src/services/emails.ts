export interface EmailInfo {
  messageID: string
  type: 'inbox' | 'draft' | 'sent'
  timeReceived: string
  subject: string
  from: string[]
  to: string[]
}

type ListEmailsProps = {
  type: 'inbox' | 'draft' | 'sent'
  year?: number
  month?: number
  order?: 'asc' | 'desc'
  pageSize?: number
  nextCursor?: string
}

type ListEmailsResponse = {
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

export async function getEmail(id: string) {
  const response = await fetch(`/web/emails/${id}`)
  return response.json()
}
