/*
 * EmailDraft.tsx
 * This component will occupy full screen when a user is composing an email.
 */

import { MinusIcon, XMarkIcon } from '@heroicons/react/20/solid'

import { DraftEmail } from '../../contexts/DraftEmailContext'

interface EmailDraftProps {
  email: DraftEmail
  handleClose: () => void
  handleMinimize: () => void
}

export function EmailDraft(props: EmailDraftProps) {
  const { email, handleClose, handleMinimize } = props

  return (
    <div className="w-full h-full rounded md:rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-t md:rounded-t-md">
        <span>{email.subject || 'New Email'}</span>
        <span className="inline-flex">
          <span
            className="-my-2 -mr-1 p-1.5 rounded-full hover:bg-gray-600 cursor-pointer"
            onClick={handleMinimize}
          >
            <MinusIcon className="w-4 h-4" />
          </span>
          <span
            className="-my-2 -mr-1 p-1.5 rounded-full hover:bg-gray-600 cursor-pointer"
            onClick={handleClose}
          >
            <XMarkIcon className="w-4 h-4" />
          </span>
        </span>
      </div>
    </div>
  )
}
