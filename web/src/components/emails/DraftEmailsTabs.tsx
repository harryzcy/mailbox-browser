import { useContext } from 'react'
import { DraftEmailsContext } from '../../contexts/DraftEmailContext'

export default function DraftEmailsTabs() {
  const draftEmailsContext = useContext(DraftEmailsContext)

  return (
    <div className="flex space-x-2 h-full text-slate-300">
      {draftEmailsContext.emails.map((email) => {
        return (
          <div
            key={email.messageID}
            className="rounded-t md:rounded-t-md bg-gray-50 dark:bg-gray-800 flex p-1 px-5 items-center cursor-pointer"
            onClick={() => {
              draftEmailsContext.dispatch({
                type: 'open',
                id: email.messageID
              })
            }}
          >
            <span>{email.subject || 'New Email'}</span>
          </div>
        )
      })}
    </div>
  )
}
