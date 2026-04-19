import useSWR from 'swr'

import { Email } from 'services/emails'

export interface Thread {
  threadID: string
  type: 'thread'
  subject: string
  emailIDs: string[]
  draftID?: string
  timeUpdated: string
  emails: Email[]
  draft?: Email
}

export function useThread(threadID: string | null) {
  const { data, error, isLoading } = useSWR<Thread, Error>(
    threadID ? `thread-${threadID}` : null,
    async () => {
      if (!threadID) {
        throw new Error('Fetching is disabled when threadID is null')
      }
      const response = await fetch(`/web/threads/${threadID}`, {
        method: 'GET'
      })
      return response.json() as Promise<Thread>
    }
  )

  return { thread: data, error, isLoading }
}

export async function getThread(threadID: string): Promise<Thread> {
  const response = await fetch(`/web/threads/${threadID}`, {
    method: 'GET'
  })
  return response.json() as Promise<Thread>
}
