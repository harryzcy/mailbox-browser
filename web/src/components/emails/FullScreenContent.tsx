import { useContext } from 'react'
import { DraftEmailsContext } from '../../contexts/DraftEmailContext'
import { EmailDraft } from './EmailDraft'

export default function FullScreenContent() {
  const draftEmailsContext = useContext(DraftEmailsContext)

  if (draftEmailsContext.activeEmail === null) {
    return null
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
    <div className="absolute left-0 top-0 right-0 bottom-0 backdrop-blur p-24">
      <EmailDraft
        email={draftEmailsContext.activeEmail}
        handleClose={handleClose}
        handleMinimize={handleMinimize}
      />
    </div>
  )
}
