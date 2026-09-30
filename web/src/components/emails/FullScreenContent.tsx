import { useContext } from 'react'
import { toast } from 'sonner'

import { DraftEmail, DraftEmailsContext } from 'contexts/DraftEmailContext'

import { useDraftAutosave } from 'hooks/useDraftAutosave'

import { deleteEmail, isLocalDraftID, useSaveEmail } from 'services/emails'

import { EmailDraft } from './EmailDraft'

interface FullScreenContentProps {
  handleDelete: (messageID: string) => void
}

export default function FullScreenContent(props: FullScreenContentProps) {
  const draftEmailsContext = useContext(DraftEmailsContext)

  const { queueSave, cancelSave } = useDraftAutosave()

  const { trigger: triggerSaveEmail } = useSaveEmail()

  const handleEmailChange = (email: DraftEmail) => {
    queueSave(email)

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

  const handleSend = async () => {
    const email = draftEmailsContext.activeEmail
    if (!email) return
    if (isLocalDraftID(email.messageID)) {
      toast.error('Draft is still being created, try again')
      return
    }

    cancelSave()
    try {
      await triggerSaveEmail({
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
    } catch (e) {
      console.error('Failed to send email', e)
      toast.error('Failed to send email')
      queueSave(email)
      return
    }

    draftEmailsContext.dispatch({
      type: 'remove',
      messageID: email.messageID
    })
  }

  const handleDelete = () => {
    const deleteRequest = async () => {
      const email = draftEmailsContext.activeEmail
      if (!email) return
      if (isLocalDraftID(email.messageID)) {
        toast.error('Draft is still being created, try again')
        return
      }
      cancelSave()
      try {
        await deleteEmail(email.messageID)
      } catch (e) {
        console.error('Failed to delete draft', e)
        toast.error('Failed to delete draft')
        queueSave(email)
        return
      }

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
    <div className="absolute top-0 left-0 h-screen w-full bg-neutral-800/40 px-2 pt-12 pb-2 md:px-36 md:py-20 dark:bg-zinc-900/90">
      <EmailDraft
        email={draftEmailsContext.activeEmail}
        handleEmailChange={handleEmailChange}
        handleClose={handleClose}
        handleMinimize={handleMinimize}
        handleSend={() => {
          void handleSend()
        }}
        handleDelete={handleDelete}
      />
    </div>
  )
}
