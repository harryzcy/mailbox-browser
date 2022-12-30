import { useContext, useState } from 'react'
import { useDebounce } from 'react-use'
import {
  DraftEmail,
  DraftEmailsContext
} from '../../contexts/DraftEmailContext'
import { EmailDraft } from './EmailDraft'

export default function FullScreenContent() {
  const draftEmailsContext = useContext(DraftEmailsContext)

  const [cachedEmail, setCachedEmail] = useState<DraftEmail | null>(null)

  useDebounce(
    () => {
      if (cachedEmail) {
        draftEmailsContext.dispatch({
          type: 'update',
          messageID: cachedEmail.messageID,
          email: cachedEmail,
          excludeInWaitlist: false
        })
      }
    },
    200,
    [cachedEmail]
  )

  const handleEmailChange = (email: DraftEmail) => {
    setCachedEmail(email)
  }

  const handleClose = () => {
    draftEmailsContext.dispatch({
      type: 'close'
    })
  }
  const handleMinimize = () => {
    draftEmailsContext.dispatch({
      type: 'minimize'
    })
  }

  if (draftEmailsContext.activeEmail === null) {
    return null
  }

  return (
    <div className="absolute left-0 top-0 right-0 bottom-0 bg-gray-800/40 dark:bg-zinc-900/90 px-36 py-20">
      <EmailDraft
        email={draftEmailsContext.activeEmail}
        handleEmailChange={handleEmailChange}
        handleClose={handleClose}
        handleMinimize={handleMinimize}
      />
    </div>
  )
}
