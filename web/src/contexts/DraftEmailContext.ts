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
}

export type State = {
  activeEmail: DraftEmail | null
  updateWaitlist: string[] // messageIDs
  emails: DraftEmail[]
}

export type Action =
  | { type: 'add'; messageID: string }
  | { type: 'load'; email: DraftEmail }
  | { type: 'open'; id: string }
  | { type: 'close' }
  | { type: 'minimize' }
  | {
      type: 'update'
      messageID: string
      email: DraftEmail
      excludeInWaitlist: boolean
    }
  | { type: 'remove-waitlist' }
  | { type: 'clear-waitlist' }
export const initialState: State = {
  activeEmail: null,
  updateWaitlist: [],
  emails: []
}

export function draftEmailReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      const newEmail = {
        messageID: action.messageID,
        subject: '',
        from: [] as string[],
        to: [] as string[],
        cc: [] as string[],
        bcc: [] as string[]
      } as DraftEmail
      return {
        activeEmail: newEmail,
        updateWaitlist: state.updateWaitlist,
        emails: [...state.emails, newEmail]
      }
    case 'load':
      const foundEmail = state.emails.find(
        (email) => email.messageID === action.email.messageID
      )
      if (foundEmail) {
        return {
          activeEmail: foundEmail,
          updateWaitlist: state.updateWaitlist,
          emails: state.emails
        }
      }
      return {
        activeEmail: action.email,
        updateWaitlist: state.updateWaitlist,
        emails: [...state.emails, action.email]
      }
    case 'open':
      return {
        activeEmail:
          state.emails.find((email) => email.messageID === action.id) || null,
        updateWaitlist: state.updateWaitlist,
        emails: state.emails
      }
    case 'minimize':
      return {
        activeEmail: null,
        updateWaitlist: state.updateWaitlist,
        emails: state.emails
      }
    case 'close':
      const emails = state.emails.filter(
        (email) => email.messageID !== state.activeEmail?.messageID
      )
      return {
        activeEmail: null,
        updateWaitlist: state.updateWaitlist,
        emails
      }
    case 'update':
      const updatedEmails = state.emails.map((email) => {
        if (email.messageID === action.messageID) {
          return action.email
        }
        return email
      })
      return {
        activeEmail:
          state.activeEmail?.messageID === action.messageID
            ? action.email
            : state.activeEmail,
        updateWaitlist:
          action.excludeInWaitlist ||
          state.updateWaitlist.includes(action.messageID)
            ? state.updateWaitlist
            : [...state.updateWaitlist, action.messageID],
        emails: updatedEmails
      }
    case 'remove-waitlist':
      return {
        activeEmail: state.activeEmail,
        updateWaitlist: state.updateWaitlist.filter(
          (messageID) => messageID !== state.activeEmail?.messageID
        ),
        emails: state.emails
      }
    case 'clear-waitlist':
      return {
        activeEmail: state.activeEmail,
        updateWaitlist: [],
        emails: state.emails
      }
  }
}

export const DraftEmailsContext = createContext<{
  activeEmail: DraftEmail | null
  emails: DraftEmail[]
  updateWaitlist: string[]
  dispatch: Dispatch<Action>
}>({
  activeEmail: null,
  emails: [],
  updateWaitlist: [],
  dispatch: () => null
})
