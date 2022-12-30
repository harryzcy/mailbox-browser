/*
 * EmailDraft.tsx
 * This component will occupy full screen when a user is composing an email.
 */

import { MinusIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useContext } from 'react'

import {
  DraftEmail,
  DraftEmailsContext
} from '../../contexts/DraftEmailContext'
import EmailAddressInput from '../inputs/EmailAddressInput'
import RichTextEditor from '../inputs/RichTextEditor'
import TextInput from '../inputs/TextInput'

interface EmailDraftProps {
  email: DraftEmail
  handleEmailChange: (email: DraftEmail) => void
  handleClose: () => void
  handleMinimize: () => void
  handleSend: () => void
}

export function EmailDraft(props: EmailDraftProps) {
  const { email, handleEmailChange, handleClose, handleMinimize, handleSend } =
    props

  const draftEmailsContext = useContext(DraftEmailsContext)

  return (
    <div className="flex flex-col w-full h-full max-h-full rounded md:rounded-md bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 shadow-md">
      <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-700 p-2 rounded-t md:rounded-t-md">
        <span>{email.subject || 'New Email'}</span>
        <span className="inline-flex">
          <span
            className="-my-2 -mr-1 p-1.5 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600 cursor-pointer"
            onClick={handleMinimize}
          >
            <MinusIcon className="w-4 h-4" />
          </span>
          <span
            className="-my-2 -mr-1 p-1.5 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600 cursor-pointer"
            onClick={handleClose}
          >
            <XMarkIcon className="w-4 h-4" />
          </span>
        </span>
      </div>

      <div className="flex px-2 pt-2">
        <span className="ml-2 px-3 py-1 w-16 text-center bg-neutral-200 dark:bg-neutral-900 rounded md:rounded-md">
          From
        </span>
        <span className="flex-1 border-b dark:border-neutral-600 mx-2">
          <EmailAddressInput
            addresses={email.from}
            handleChange={(emails) => {
              handleEmailChange({ ...email, from: emails })
            }}
          />
        </span>
      </div>
      <div className="flex px-2 pt-2">
        <span className="ml-2 px-3 py-1 w-16 text-center bg-neutral-200 dark:bg-neutral-900 rounded md:rounded-md">
          To
        </span>
        <span className="flex-1 border-b dark:border-neutral-600 mx-2">
          <EmailAddressInput
            addresses={email.to}
            handleChange={(emails) => {
              handleEmailChange({ ...email, to: emails })
            }}
          />
        </span>
      </div>
      <div className="flex px-2 pt-2">
        <span className="ml-2 px-3 py-1 w-16 text-center bg-neutral-200 dark:bg-neutral-900 rounded md:rounded-md">
          Cc
        </span>
        <span className="flex-1 border-b dark:border-neutral-600 mx-2">
          <EmailAddressInput
            addresses={email.cc}
            handleChange={(emails) => {
              handleEmailChange({ ...email, cc: emails })
            }}
          />
        </span>
      </div>
      <div className="flex px-2 pt-2">
        <span className="ml-2 px-3 py-1 w-16 text-center bg-neutral-200 dark:bg-neutral-900 rounded md:rounded-md">
          Bcc
        </span>
        <span className="flex-1 border-b dark:border-neutral-600 mx-2">
          <EmailAddressInput
            addresses={email.bcc}
            handleChange={(emails) => {
              handleEmailChange({ ...email, bcc: emails })
            }}
          />
        </span>
      </div>

      <div className="flex px-2 pt-3">
        <span className="flex-1 border-b dark:border-neutral-600 mx-2">
          <TextInput
            placeholder="Subject"
            handleChange={(subject) => {
              handleEmailChange({ ...email, subject })
            }}
          />
        </span>
      </div>

      <div className="flex-1 flex px-2 pt-3 overscroll-contain overflow-scroll">
        <RichTextEditor
          handleChange={({ html, text }) => {
            handleEmailChange({ ...email, html, text })
          }}
          handleSend={handleSend}
        />
      </div>
    </div>
  )
}
