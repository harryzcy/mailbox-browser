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
        'fixed w-full h-[3rem] -mx-8 px-8 pt-2' +
        (draftEmailsContext.activeEmail === null
          ? ' bg-neutral-50 dark:bg-neutral-900'
          : '')
      }
    >
      <div className="flex space-x-2 h-full text-slate-900 dark:text-slate-300">
        {draftEmailsContext.emails.map((email) => {
          return (
            <div
              key={email.messageID}
              className="rounded-t md:rounded-t-md bg-neutral-200 dark:bg-neutral-800 flex p-1 px-5 items-center cursor-pointer"
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
