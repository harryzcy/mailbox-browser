import { createContext, Dispatch } from 'react'

export interface DraftEmail {
  id: string
}

export type Action = { type: 'add' }

export function draftEmailReducer(
  emails: DraftEmail[],
  action: Action
): DraftEmail[] {
  switch (action.type) {
    case 'add':
      const newEmail = {} as DraftEmail
      return [...emails, newEmail]
  }
}

export const DraftEmailsContext = createContext<{
  emails: DraftEmail[]
  dispatch: Dispatch<Action>
}>({
  emails: [],
  dispatch: () => null
})
