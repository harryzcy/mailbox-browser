import { useContext } from 'react'
import {
  DraftEmail,
  DraftEmailsContext
} from '../../contexts/DraftEmailContext'
import { deleteEmail, saveEmail } from '../../services/emails'
import { EmailDraft } from './EmailDraft'

interface FullScreenContentProps {
  handleDelete: (messageID: string) => void
}

export default function FullScreenContent(props: FullScreenContentProps) {
  const draftEmailsContext = useContext(DraftEmailsContext)

  const handleEmailChange = (email: DraftEmail) => {
    draftEmailsContext.dispatch({
      type: 'update',
      messageID: email.messageID,
      email
    })
  }

  const handleClose = () => {
    if (!draftEmailsContext.activeEmail) return

    draftEmailsContext.dispatch({
      type: 'remove',
      messageID: draftEmailsContext.activeEmail.messageID
    })
  }

  const handleMinimize = () => {
    draftEmailsContext.dispatch({
      type: 'minimize'
    })
  }

  const handleSend = () => {
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
        type: 'remove',
        messageID: email.messageID
      })
    }

    void sendRequest()
  }

  const handleDelete = () => {
    const deleteRequest = async () => {
      const email = draftEmailsContext.activeEmail
      if (!email) return
      await deleteEmail(email.messageID)

      draftEmailsContext.dispatch({
        type: 'remove',
        messageID: email.messageID
      })
      props.handleDelete(email.messageID)
    }

    void deleteRequest()
  }

  if (
    draftEmailsContext.activeEmail === null ||
    draftEmailsContext.activeEmail.replyEmail ||
    draftEmailsContext.activeEmail.threadID
  ) {
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
        handleDelete={handleDelete}
      />
    </div>
  )
}
