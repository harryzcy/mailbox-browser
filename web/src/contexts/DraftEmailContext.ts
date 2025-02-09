import { Dispatch, createContext } from 'react'

import { Email } from 'services/emails'

import { formatDateFull } from 'utils/time'

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

export interface State {
  activeEmail: DraftEmail | null
  emails: DraftEmail[]
}

export const initialState: State = {
  activeEmail: null,
  emails: []
}

export type Action =
  | {
      // new email that's not a reply or forward
      type: 'new'
      messageID: string
    }
  | {
      // new reply email
      type: 'new-reply'
      messageID: string
      allowedAddresses: string[] // the allowed addresses to send from
      replyEmail: Email
    }
  | {
      // new forward email
      type: 'new-forward'
      messageID: string
      forwardEmail: Email
    }
  | {
      // open an email already in the working directory
      type: 'open'
      messageID: string
    }
  | {
      // load an email to the working directory
      type: 'load'
      email: DraftEmail
    }
  | {
      // exit the full screen email view
      type: 'minimize'
    }
  | {
      // remove an email from the working directory
      type: 'remove'
      messageID: string
    }
  | {
      // update an email in the working directory
      type: 'update'
      messageID: string // the original messageID of the email to update
      email: DraftEmail
    }

/**
 * Create a new empty email.
 * @returns the new draft email
 */
function newEmptyEmail(messageID: string): DraftEmail {
  return {
    messageID,
    subject: '',
    from: [] as string[],
    to: [] as string[],
    cc: [] as string[],
    bcc: [] as string[]
  } as DraftEmail
}

/**
 * Add a prefix to a subject only if it doesn't already have it.
 * It's useful for adding "Re: " or "Fwd: " to a subject.
 * @returns the subject with the prefix
 */
function addPrefix(subject: string, prefix: string) {
  return subject.startsWith(prefix) ? subject : prefix + subject
}

export function draftEmailReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'new': {
      const newEmail = newEmptyEmail(action.messageID)
      return {
        activeEmail: newEmail,
        emails: [...state.emails, newEmail]
      }
    }

    case 'new-reply': {
      const newEmail = newEmptyEmail(action.messageID)
      newEmail.replyEmail = action.replyEmail

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
      newEmail.subject = addPrefix(action.replyEmail.subject, 'Re: ')

      return {
        activeEmail: newEmail,
        emails: [...state.emails, newEmail]
      }
    }

    case 'new-forward': {
      const newEmail = newEmptyEmail(action.messageID)
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
      return {
        activeEmail: newEmail,
        emails: [...state.emails, newEmail]
      }
    }

    case 'open':
      return {
        activeEmail:
          state.emails.find((email) => email.messageID === action.messageID) ??
          null,
        emails: state.emails
      }

    case 'load': {
      const foundEmail = state.emails.find(
        (email) => email.messageID === action.email.messageID
      )
      if (foundEmail) {
        return {
          activeEmail: foundEmail,
          emails: state.emails
        }
      }
      const email = {
        ...action.email,
        html: extractEmailBody(action.email.html)
      }
      return {
        activeEmail: email,
        emails: [...state.emails, email]
      }
    }

    case 'minimize':
      return {
        activeEmail: null,
        emails: state.emails
      }

    case 'remove':
      // if the active email is the one being removed, set it to null
      // otherwise, keep it the same
      return {
        activeEmail:
          state.activeEmail?.messageID == action.messageID
            ? null
            : state.activeEmail,
        emails: state.emails.filter(
          (email) => email.messageID !== action.messageID
        )
      }

    case 'update': {
      const updatedEmails = state.emails.map((email) => {
        if (email.messageID === action.messageID) {
          return {
            ...action.email,
            replyEmail: email.replyEmail,
            threadID: email.threadID
          }
        }
        return email
      })
      return {
        activeEmail:
          state.activeEmail?.messageID === action.messageID
            ? {
                ...action.email,
                replyEmail: state.activeEmail.replyEmail,
                threadID: state.activeEmail.threadID
              }
            : state.activeEmail,
        emails: updatedEmails
      }
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

const extractEmailBody = (html?: string) => {
  if (!html) return ''
  if (html.includes('<body>')) {
    const body = /<body>(.*?)<\/body>/gs.exec(html)?.[1] ?? ''
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
      return name ? `${name} &#60;${address}&#62;` : address // &#60; and &#62; are < and > respectively
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

  const countSubstring = (str: string, sub: string) => {
    return str.split(sub).length - 1
  }
  if (countSubstring(address, '<') == 1 && countSubstring(address, '>') == 1) {
    displayName = address.split('<')[0].trim()
    email = address.split('<')[1].replaceAll('>', '').trim()

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
