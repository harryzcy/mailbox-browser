import { createContext, Dispatch } from 'react'
import { Email } from '../services/emails'

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
  replyEmail?: Email
}

export type State = {
  activeEmail: DraftEmail | null
  updateWaitlist: string[] // messageIDs
  emails: DraftEmail[]
}

export type Action =
  | { type: 'add'; messageID: string; isReply?: boolean; replyEmail?: Email }
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
        bcc: [] as string[],
        replyEmail: action.replyEmail
      } as DraftEmail

      if (action.isReply && action.replyEmail) {
        // TODO: use the correct sender based on domain
        newEmail.from = [action.replyEmail.to[0]]
        newEmail.to = [action.replyEmail.from[0]]
        newEmail.subject = action.replyEmail.subject.startsWith('Re: ')
          ? action.replyEmail.subject
          : `Re: ${action.replyEmail.subject}`
      }

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
      const email = {
        ...action.email,
        html: extractEmailBody(action.email.html)
      }
      return {
        activeEmail: email,
        updateWaitlist: state.updateWaitlist,
        emails: [...state.emails, email]
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

const extractEmailBody = (html: string) => {
  const body = /<body>(.*?)<\/body>/g.exec(html)?.[1] || ''
  return body
}
