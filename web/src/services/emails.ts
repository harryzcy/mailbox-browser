type ListEmailsProps = {
  type: 'inbox' | 'draft' | 'sent'
  year?: number
  month?: number
  order?: 'asc' | 'desc'
  nextCursor?: string
}

export async function listEmails(props: ListEmailsProps) {
  const { type, year, month, order, nextCursor } = props
  const response = await fetch('/web/emails', {
    method: 'GET',
    body: JSON.stringify({
      type,
      year,
      month,
      order,
      nextCursor
    })
  })
  return response.json()
}

export async function getEmail(id: string) {
  const response = await fetch(`/web/emails/${id}`)
  return response.json()
}
