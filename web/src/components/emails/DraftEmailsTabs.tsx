import { useContext } from 'react'
import { DraftEmailsContext } from '../../contexts/DraftEmailContext'

export default function DraftEmailsTabs() {
  const draftEmailsContext = useContext(DraftEmailsContext)

  return (
    <div className="flex space-x-2 h-full text-slate-300">
      {draftEmailsContext.emails.map(() => {
        return (
          <div className="rounded-t md:rounded-t-md bg-gray-50 dark:bg-gray-800 flex p-1 px-3 items-center">
            <span>Email Draft</span>
          </div>
        )
      })}
    </div>
  )
}
