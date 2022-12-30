import { useContext } from 'react'
import {
  DraftEmail,
  DraftEmailsContext
} from '../../contexts/DraftEmailContext'
import { saveEmail } from '../../services/emails'
import { EmailDraft } from './EmailDraft'

export default function FullScreenContent() {
  const draftEmailsContext = useContext(DraftEmailsContext)

  const handleEmailChange = (email: DraftEmail) => {
    draftEmailsContext.dispatch({
      type: 'update',
      messageID: email.messageID,
      email,
      excludeInWaitlist: false
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

  const handleSend = () => {
    // prevent still saving emails
    draftEmailsContext.dispatch({
      type: 'remove-waitlist'
    })

    const sendRequest = async () => {
      const email = draftEmailsContext.activeEmail
      if (!email) return
      await saveEmail({
        messageID: email.messageID,
        subject: email.subject,
        from: email.from,
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        replyTo: email.from,
        html: email.html,
        text: email.text,
        send: true // save and send
      })

      draftEmailsContext.dispatch({
        type: 'close'
      })
    }

    sendRequest()
  }

  if (draftEmailsContext.activeEmail === null) {
    return null
  }

  return (
    <div className="absolute left-0 top-0 right-0 bottom-0 bg-neutral-800/40 dark:bg-zinc-900/90 px-36 py-20">
      <EmailDraft
        email={draftEmailsContext.activeEmail}
        handleEmailChange={handleEmailChange}
        handleClose={handleClose}
        handleMinimize={handleMinimize}
        handleSend={handleSend}
      />
    </div>
  )
}
