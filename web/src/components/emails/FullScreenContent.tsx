import { useContext } from 'react'
import {
  DraftEmail,
  DraftEmailsContext
} from '../../contexts/DraftEmailContext'
import { EmailDraft } from './EmailDraft'

export default function FullScreenContent() {
  const draftEmailsContext = useContext(DraftEmailsContext)

  if (draftEmailsContext.activeEmail === null) {
    return null
  }

  const handleEmailChange = (email: DraftEmail) => {
    draftEmailsContext.dispatch({
      type: 'update',
      email
    })
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

  return (
    <div className="absolute left-0 top-0 right-0 bottom-0 backdrop-blur px-36 py-20">
      <EmailDraft
        email={draftEmailsContext.activeEmail}
        handleEmailChange={handleEmailChange}
        handleClose={handleClose}
        handleMinimize={handleMinimize}
      />
    </div>
  )
}
