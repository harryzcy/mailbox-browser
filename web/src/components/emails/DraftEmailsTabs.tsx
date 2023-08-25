import { useContext } from 'react'
import { DraftEmailsContext } from '../../contexts/DraftEmailContext'

export default function DraftEmailsTabs() {
  const draftEmailsContext = useContext(DraftEmailsContext)

  if (draftEmailsContext.emails.length === 0) {
    return null
  }

  return (
    <div
      className={
        'fixed -mx-8 h-[3rem] w-full px-8 pt-2' +
        (draftEmailsContext.activeEmail === null
          ? ' bg-neutral-50 dark:bg-neutral-900'
          : '')
      }
    >
      <div className="flex h-full space-x-2 text-slate-900 dark:text-slate-300">
        {draftEmailsContext.emails.map((email) => {
          return (
            <div
              key={email.messageID}
              className="flex cursor-pointer items-center rounded-t bg-neutral-200 p-1 px-5 dark:bg-neutral-800 md:rounded-t-md"
              onClick={() => {
                draftEmailsContext.dispatch({
                  type: 'open',
                  messageID: email.messageID
                })
              }}
            >
              <span>{email.subject || 'New Email'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
