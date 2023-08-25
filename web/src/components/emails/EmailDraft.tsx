/*
 * EmailDraft.tsx
 * This component will occupy full screen when a user is composing an email.
 */
import { MinusIcon, XMarkIcon } from '@heroicons/react/20/solid'

import { DraftEmail } from '../../contexts/DraftEmailContext'
import EmailAddressInput from '../inputs/EmailAddressInput'
import RichTextEditor from '../inputs/RichTextEditor'
import TextInput from '../inputs/TextInput'

interface EmailDraftProps {
  email: DraftEmail
  handleEmailChange: (email: DraftEmail) => void
  handleClose?: () => void
  handleMinimize?: () => void
  handleSend: () => void
  handleDelete?: () => void
  isReply?: boolean
}

export function EmailDraft(props: EmailDraftProps) {
  const {
    email,
    handleEmailChange,
    handleClose,
    handleMinimize,
    handleSend,
    handleDelete,
    isReply = false
  } = props

  return (
    <div
      className={`flex w-full flex-col rounded bg-neutral-50 text-neutral-800 shadow-md dark:bg-neutral-800 dark:text-neutral-100 md:rounded-md ${
        !isReply ? ' h-full max-h-full' : ''
      }`}
    >
      {!isReply && (
        <div className="flex items-center justify-between rounded-t bg-neutral-100 p-2 dark:bg-neutral-700 md:rounded-t-md">
          <span>{email.subject || 'New Email'}</span>
          <span className="inline-flex">
            <span
              className="-my-2 -mr-1 cursor-pointer rounded-full p-1.5 hover:bg-neutral-300 dark:hover:bg-neutral-600"
              onClick={handleMinimize}
            >
              <MinusIcon className="h-4 w-4" />
            </span>
            <span
              className="-my-2 -mr-1 cursor-pointer rounded-full p-1.5 hover:bg-neutral-300 dark:hover:bg-neutral-600"
              onClick={handleClose}
            >
              <XMarkIcon className="h-4 w-4" />
            </span>
          </span>
        </div>
      )}

      {!isReply && (
        <div className="flex px-2 pt-2">
          <span className="ml-2 w-16 rounded bg-neutral-200 px-3 py-1 text-center dark:bg-neutral-900 md:rounded-md">
            From
          </span>
          <span className="mx-2 flex-1 border-b dark:border-neutral-600">
            <EmailAddressInput
              addresses={email.from || []}
              handleChange={(emails) => {
                handleEmailChange({ ...email, from: emails })
              }}
            />
          </span>
        </div>
      )}
      <div className="flex px-2 pt-2">
        <span className="ml-2 w-16 rounded bg-neutral-200 px-3 py-1 text-center dark:bg-neutral-900 md:rounded-md">
          To
        </span>
        <span className="mx-2 flex-1 border-b dark:border-neutral-600">
          <EmailAddressInput
            addresses={email.to || []}
            handleChange={(emails) => {
              handleEmailChange({ ...email, to: emails })
            }}
          />
        </span>
      </div>
      <div className="flex px-2 pt-2">
        <span className="ml-2 w-16 rounded bg-neutral-200 px-3 py-1 text-center dark:bg-neutral-900 md:rounded-md">
          Cc
        </span>
        <span className="mx-2 flex-1 border-b dark:border-neutral-600">
          <EmailAddressInput
            addresses={email.cc || []}
            handleChange={(emails) => {
              handleEmailChange({ ...email, cc: emails })
            }}
          />
        </span>
      </div>
      <div className="flex px-2 pt-2">
        <span className="ml-2 w-16 rounded bg-neutral-200 px-3 py-1 text-center dark:bg-neutral-900 md:rounded-md">
          Bcc
        </span>
        <span className="mx-2 flex-1 border-b dark:border-neutral-600">
          <EmailAddressInput
            addresses={email.bcc || []}
            handleChange={(emails) => {
              handleEmailChange({ ...email, bcc: emails })
            }}
          />
        </span>
      </div>

      {
        // Reply emails should used standard subject
        !isReply && (
          <div className="flex px-2 pt-3">
            <span className="mx-2 flex-1 border-b dark:border-neutral-600">
              <TextInput
                value={email.subject || ''}
                placeholder="Subject"
                handleChange={(subject) => {
                  handleEmailChange({ ...email, subject })
                }}
              />
            </span>
          </div>
        )
      }

      <div className="flex flex-1 overflow-scroll overscroll-contain px-2 pt-3">
        <RichTextEditor
          initialHtml={email.html || ''}
          handleChange={({ html, text }) => {
            handleEmailChange({ ...email, html, text })
          }}
          handleSend={handleSend}
          handleDelete={() => {
            handleDelete && handleDelete()
          }}
        />
      </div>
    </div>
  )
}
