import { createContext, Dispatch } from 'react'

export interface DraftEmail {
  messageID: string
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

export type State = {
  activeEmail: DraftEmail | null
  emails: DraftEmail[]
}
export type Action =
  | { type: 'add' }
  | { type: 'open'; id: string }
  | { type: 'close' }
  | { type: 'minimize' }
export const initialState: State = {
  activeEmail: null,
  emails: []
}

export function draftEmailReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      const newEmail = {
        messageID: Date.now().toString()
      } as DraftEmail
      return {
        activeEmail: newEmail,
        emails: [...state.emails, newEmail]
      }
    case 'open':
      return {
        activeEmail:
          state.emails.find((email) => email.messageID === action.id) || null,
        emails: state.emails
      }
    case 'minimize':
      return {
        activeEmail: null,
        emails: state.emails
      }
    case 'close':
      const emails = state.emails.filter(
        (email) => email.messageID !== state.activeEmail?.messageID
      )
      return {
        activeEmail: null,
        emails
      }
  }
}

export const DraftEmailsContext = createContext<{
  activeEmail: DraftEmail | null
  emails: DraftEmail[]
  dispatch: Dispatch<Action>
}>({
  activeEmail: null,
  emails: [],
  dispatch: () => null
})
