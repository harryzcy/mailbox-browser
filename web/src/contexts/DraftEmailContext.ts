import { createContext, Dispatch, useContext } from 'react'
import { Email } from '../services/emails'
import { formatDateFull } from '../utils/time'

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
  threadID?: string
}

export type State = {
  activeEmail: DraftEmail | null
  updateWaitlist: string[] // messageIDs
  emails: DraftEmail[]
}

export type Action =
  | {
      type: 'add'
      messageID: string
      isReply?: boolean
      replyEmail?: Email
      allowedAddresses?: string[] // the allowed addresses to send from
      isForward?: boolean
      forwardEmail?: Email
    }
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
        if (action.replyEmail.type === 'inbox') {
          newEmail.from = determineFromAddress(
            action.replyEmail.to,
            action.allowedAddresses
          )
          newEmail.to = [action.replyEmail.from[0]]
        } else {
          // sent
          newEmail.from = [action.replyEmail.from[0]]
          newEmail.to = [action.replyEmail.to[0]]
        }
        newEmail.subject = action.replyEmail.subject.startsWith('Re: ')
          ? action.replyEmail.subject
          : `Re: ${action.replyEmail.subject}`
      }
      if (action.isForward && action.forwardEmail) {
        if (action.forwardEmail.type === 'inbox') {
          newEmail.from = [action.forwardEmail.to[0]]
        } else {
          // sent
          newEmail.from = [action.forwardEmail.from[0]]
        }
        newEmail.subject = action.forwardEmail.subject.startsWith('Fwd: ')
          ? action.forwardEmail.subject
          : `Fwd: ${action.forwardEmail.subject}`
        newEmail.html = createForwardHTML(action.forwardEmail)
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
  if (html.includes('<body>')) {
    const body = /<body>(.*?)<\/body>/gs.exec(html)?.[1] || ''
    return body
  }
  return html
}

const createForwardHTML = (email: Email): string => {
  const { html, timeReceived, timeSent, from } = email
  const time = timeReceived || timeSent

  const fromStr = from
    .map((raw) => {
      const { name, address } = parseAddress(raw)
      return name ? `${name} &#60;${address}&#62;` : address
    })
    .join(', ')

  const body = extractEmailBody(html)
  const forwardHTML = `
  <p class="editor-paragraph"><br></p>
  <p class="editor-paragraph">On ${formatDateFull(time)} ${fromStr} wrote:</p>
  <div class="editor-email-quote">${body}</div>`
  return forwardHTML
}

const parseAddress = (
  address: string
): {
  name: string
  address: string
} => {
  address = address.trim()

  let displayName = ''
  let email = ''

  if (address.includes('<')) {
    displayName = address.split('<')[0].trim()
    email = address.split('<')[1].replace('>', '').trim()

    if (displayName.startsWith('"') && displayName.endsWith('"')) {
      displayName = displayName.slice(1, -1)
    }
  } else {
    email = address
  }

  return {
    name: displayName,
    address: email
  }
}

const determineFromAddress = (
  choices: string[],
  allowedAddresses?: string[]
): string[] => {
  if (!allowedAddresses) {
    // TODO: handle this better
    console.warn("Couldn't find a matching email address.")
    return [choices[0]]
  }

  for (const address of choices) {
    for (const expectedAddress of allowedAddresses) {
      const hasPrefix = expectedAddress.includes('@')
      if (hasPrefix) {
        if (address === expectedAddress) {
          return [address]
        }
      } else {
        const domain = address.split('@')[1]
        if (domain === expectedAddress) {
          return [address]
        }
      }
    }
  }

  // TODO: handle this better
  console.warn("Couldn't find a matching email address.")
  return [choices[0]]
}
