import { Email } from './emails'

export interface Thread {
  threadID: string
  type: 'thread'
  subject: string
  emailIDs: string[]
  timeUpdated: string
  emails: Email[]
}

export async function getThread(threadID: string): Promise<Thread> {
  const response = await fetch(`/web/threads/${threadID}`, {
    method: 'GET'
  })
  return response.json()
}
